import { model, Schema, Document, Types } from 'mongoose';
import { AsyncStorageService } from '../../../../../common/shared/services/async-localstorage.service';

interface IHistoryDocument extends Document {
  originalId: Types.ObjectId;
  changes: Record<string, any>;
  snapshot?: any;
  modelName: string;
  actions: 'create' | 'update' | 'softDelete' | 'hardDelete' | 'restore';
  modifiedBy?: Types.ObjectId;
}

const historySchema = new Schema<IHistoryDocument>(
  {
    originalId: { type: Schema.Types.ObjectId, required: true },
    changes: { type: Object, required: true },
    snapshot: { type: Object },
    modelName: { type: String, required: true },
    actions: {
      type: String,
      enum: ['create', 'update', 'softDelete', 'hardDelete', 'restore'],
      required: true,
    },
    modifiedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const HisotryModel = model<IHistoryDocument>('History', historySchema);

const historyPlugin = <T extends Document>(
  schema: Schema<T>,
  options: { modelName: string },
) => {
  const createHistoryEntry = async (
    doc: Document,
    action: string,
    changes: Record<string, any> = {},
    snapshot?: any,
  ) => {
    const currentUser = AsyncStorageService.getInstance().get('currentUser');

    await new HisotryModel({
      originalId: doc._id,
      changes,
      snapshot,
      modelName: options.modelName,
      action,
      modifiedBy: currentUser.id,
    }).save();
  };

  schema.pre<T>('save', async function (next) {
    const action = this.isNew ? 'create' : 'update';
    const changes = this.isNew
      ? this.toObject() //store the entire document to object
      : this.modifiedPaths().reduce(
          (acc: Record<string, any>, path: string) => {
            acc[path] = this.get(path);
            return acc;
          },
          {},
        ); //store the modified documents object

    const snapshot = this.toObject(); //get the current document
    await createHistoryEntry(this, action, changes, snapshot);
  });

  schema.methods.softDelete = async function (
    this: T & { deletedAt: Date | null },
  ) {
    this.deletedAt = new Date();
    const snapshot = this.toObject();
    await createHistoryEntry(
      this as Document,
      'softDelete',
      { deletedAt: this.deletedAt },
      snapshot,
    );
  };

  schema.methods.restore = async function (
    this: T & { deletedAt: Date | null },
  ) {
    this.deletedAt = null;
    await this.save();
    const snapshot = this.toObject();
    await createHistoryEntry(
      this as Document,
      'restore',
      { deletedAt: null },
      snapshot,
    );
  };

  schema.pre<T>(
    'deleteOne',
    { document: true, query: false },
    async function (next) {
      const snapshot = this.toObject();
      await createHistoryEntry(this, 'hardDelete', {}, snapshot);
      next();
    },
  );

  schema.pre('findOneAndDelete', async function (next) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      const snapshot = doc.toObject();
      await createHistoryEntry(doc as Document, 'hardDelete', {}, snapshot);
    }
    next();
  });

  schema.pre('deleteMany', async function (next) {
    const docs = await this.model.find(this.getQuery());
    for (const doc of docs) {
      const snapshot = doc.toObject();
      await createHistoryEntry(doc as Document, 'hardDelete', {}, snapshot);
    }
    next();
  });

  schema.pre('updateMany', async function (next) {
    const updates = this.getUpdate;
    const docs = await this.model.find(this.getQuery);
    for (const doc of docs) {
      const snapshot = doc.toObject();
      await createHistoryEntry(
        doc as Document,
        'update',
        updates as Record<string, any>,
        snapshot,
      );
    }
    next();
  });
};

export default historyPlugin;

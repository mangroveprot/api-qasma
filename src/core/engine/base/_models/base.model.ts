import {
  Schema,
  Document,
  model as mongooseModel,
  Model,
  modelNames,
} from 'mongoose';
import PluginManager from './_plugins';

interface ITimeStamps {
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  createdAt?: Date | null;
  updatedBy?: string | null;
  updatedAt?: Date | null;
  __version__?: number;
  [key: string]: any;
}

interface IBaseModel extends ITimeStamps, Document {}

function createBaseSchema<T extends IBaseModel>(
  definition: Record<string, any>,
  options: {
    excludePlugins?: string[];
    includePlugins?: [(schema: Schema, options: any) => void, object?][];
    modelName?: string;
  },
): Schema<T> {
  const baseSchema = new Schema<T>(
    {
      ...definition,
      deletedAt: { type: Date, default: null },
      deletedBy: { type: String, default: null },
      createdBy: { type: String, default: null },
      updatedBy: { type: String, default: null },
      __version__: { type: String, default: 0 },
    },
    { timestamps: true },
  );

  PluginManager.applyPlugins(baseSchema, {
    exclude: options.excludePlugins,
    include: options.includePlugins,
    modelName: options.modelName,
  });
  return baseSchema;
}

class BaseModel<T extends IBaseModel> {
  private model: Model<T>;
  constructor(modelName: string, schema: Schema<T>) {
    this.model = mongooseModel<T>(modelName, schema);
  }

  getModel() {
    return this.model;
  }
}

export { createBaseSchema, BaseModel, IBaseModel, ITimeStamps };

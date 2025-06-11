import { Schema, Document } from 'mongoose';

interface IVersionDocument extends Document {
  __version__: number;
}

const versioningPlugin = (schema: Schema) => {
  schema.add({ __version__: { type: Number, default: 0 } });

  const incrementVersion = (update: any) => {
    if (update) {
      if (!update.$set) {
        update.$set = {};
      }
      update.$set.__version__ = (update.$set.__version__ || 0) + 1;
    }
  };
};

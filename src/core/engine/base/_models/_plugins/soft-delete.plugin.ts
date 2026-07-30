import moment from 'moment-timezone';
import { Schema } from 'mongoose';
import { config } from '../../../../config';

const softDeletePlugin = (schema: Schema) => {
  const deletedAtField = 'deletedAt';

  if (!schema.path(deletedAtField)) {
    schema.add({ [deletedAtField]: { type: Date, default: null } });
  }

  schema.methods.softDelete = async function () {
    this[deletedAtField] = moment.tz(config.timeZone).toDate();
    await this.save();
  };

  schema.methods.restore = async function () {
    this[deletedAtField] = null;
    await this.save();
  };

  const addNotDeleteCondition = function (this: any) {
    if (this.getOptions().includeDeleted) {
      return;
    }
    this.where({ [deletedAtField]: null });
  };

  schema.pre('find', addNotDeleteCondition);
  schema.pre('findOne', addNotDeleteCondition);
  schema.pre('findOneAndUpdate', addNotDeleteCondition);
  schema.pre('updateMany', addNotDeleteCondition);
  schema.pre('countDocuments', addNotDeleteCondition);
};

export default softDeletePlugin;

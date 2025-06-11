import { Schema } from 'mongoose';

const softDeletePlugin = (schema: Schema) => {
  const deletedAtField = 'deletedAt';

  //if no deleted field in schema then add the field
  if (!schema.path(deletedAtField)) {
    schema.add({ [deletedAtField]: { type: Date, default: null } });
  }

  schema.methods.softDelete = async function () {
    this[deletedAtField] = new Date();
    await this.save();
  };

  schema.methods.restore = async function () {
    this[deletedAtField] = null;
    await this.save();
  };

  const adddNotDeleteCondition = function (this: any) {
    this.where({ [deletedAtField]: null });
  };

  //this mongo query hook run this function before querying
  schema.pre('find', adddNotDeleteCondition);
  schema.pre('findOne', adddNotDeleteCondition);
  schema.pre('findOneAndUpdate', adddNotDeleteCondition);
  schema.pre('updateMany', adddNotDeleteCondition);
};

export default softDeletePlugin;

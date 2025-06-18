import { CallbackError, Document, modelNames, Schema } from 'mongoose';
import bycrypt from 'bcrypt';
import {
  BaseModel,
  createBaseSchema,
  IBaseModel,
} from '../../../../core/engine';
import { config } from '../../../../core/config';
import { IUser } from '../../types';

const USER_MODEL_NAME = 'User';

export interface IUserModel extends IUser, IBaseModel, Document {}

const UserSchema = createBaseSchema<IUserModel>(
  {
    idNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'staff', 'counselor'],
      required: true,
    },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    first_name: { type: String, required: true },
    middle_name: { type: String },
    last_name: { type: String, required: true },
    suffix: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    date_of_birth: { type: Date, required: true },
    contact_number: { type: String, required: true },
    address: { type: String },
    facebook: { type: String },
    other_info: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    modelName: USER_MODEL_NAME,
  },
);

UserSchema.pre('save', async function (next) {
  try {
    if (this.isNew || this.isModified('password')) {
      const salt = await bycrypt.genSalt(config.bcrypt.saltRound);
      const hashedPassword = await bycrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

const UserModelMongoose = new BaseModel<IUserModel>(
  USER_MODEL_NAME,
  UserSchema,
).getModel();

export default UserModelMongoose;

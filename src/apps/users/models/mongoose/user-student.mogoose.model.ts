import { CallbackError, Document, modelNames } from 'mongoose';
import bycrypt from 'bcrypt';
import { IUserStudent } from '../../types/student';
import { BaseModel, createBaseSchema } from '../../../../core/engine';
import { config } from '../../../../core/config';
import { boolean } from 'joi';

const USER_MODEL_NAME = 'User';

export interface IUserStudentDocument extends IUserStudent, Document {}

const UserStudentSchema = createBaseSchema<IUserStudentDocument>(
  {
    idNumber: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'facil'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    course: { type: String, required: true },
    block: { type: String, required: false },
    year_level: { type: Number, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    middle_name: { type: String, required: false },
    suffix: { type: String, required: false },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    date_of_birth: { type: Date, required: true },
    address: { type: String, required: true },
    contact_number: { type: String, required: false },
    facebook: { type: String, required: false },
  },
  {
    modelName: USER_MODEL_NAME,
  },
);

UserStudentSchema.pre('save', async function (next) {
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

const UserStudentModelMongoose = new BaseModel<IUserStudentDocument>(
  USER_MODEL_NAME,
  UserStudentSchema,
).getModel();

export default UserStudentModelMongoose;

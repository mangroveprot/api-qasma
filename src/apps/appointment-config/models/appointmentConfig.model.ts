import { Document, Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel, createBaseSchema, IBaseModel } from '../../../core/engine';
import { IAppointmentConfig } from '../types';

const APPOINTMENT_CONFIG_MODEL_NAME = 'AppointmentConfig';

export interface IAppointmentConfigModel
  extends IAppointmentConfig,
    IBaseModel,
    Document {}

const AppointmentConfigSchema = createBaseSchema<IAppointmentConfigModel>(
  {
    configId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    session_duration: { type: Number, required: true },
    bufferTime: { type: Number, required: true },
    reminders: { type: [String], required: true },
    categoryAndType: {
      type: Map,
      of: [String],
      required: true,
    },
  },
  {
    modelName: APPOINTMENT_CONFIG_MODEL_NAME,
    excludePlugins: ['softDeletePlugin'],
  },
);

const AppointConfigModel = new BaseModel<IAppointmentConfigModel>(
  APPOINTMENT_CONFIG_MODEL_NAME,
  AppointmentConfigSchema,
).getModel();

export default AppointConfigModel;

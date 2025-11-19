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
    buffer_time: { type: Number, required: true },
    booking_lead_time: { type: Number, required: true },
    slot_days_range: { type: Number, required: true },
    reminders: { type: [String], required: true },
    available_day_time: {
      type: Schema.Types.Mixed,
      required: false,
    },
    category_and_type: {
      type: Schema.Types.Mixed,
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

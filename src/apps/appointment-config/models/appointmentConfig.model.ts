import { Document, Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel, createBaseSchema, IBaseModel } from '../../../core/engine';
import { IAppointmentConfig } from '../types';

const APPOINTMENT_CONFIG_MODEL_NAME = 'AppointmentConfig';

export interface IAppointmentConfigModel
  extends IAppointmentConfig,
    IBaseModel,
    Document {}

const categoryTypeSchema = new Schema(
  {
    type: { type: String, required: true },
    duration: { type: Number, required: true },
  },
  { _id: false },
);

const AppointmentConfigSchema = createBaseSchema<IAppointmentConfigModel>(
  {
    configId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    session_duration: { type: Number, required: true },
    buffer_time: { type: Number, required: true },
    booking_lead_time: { type: Number, required: true },
    slot_days_range: { type: Number, required: true },
    reminders: { type: [String], required: true },
    available_day_time: {
      type: Map,
      of: [
        {
          _id: false,
          start: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm
          },
          end: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm
          },
        },
      ],
      required: false,
    },
    category_and_type: {
      type: Map,
      of: [categoryTypeSchema],
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

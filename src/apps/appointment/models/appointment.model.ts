import { CallbackError, Document, modelNames, Schema } from 'mongoose';
import { CheckInStatus, IAppointment, Status } from '../types';
import { BaseModel, createBaseSchema, IBaseModel } from '../../../core/engine';
import { v4 as uuidv4 } from 'uuid';

const APPOINTMENT_MODEL_NAME = 'Appointment';

export interface IAppointmentModel extends IAppointment, IBaseModel, Document {}

const AppointmentSchema = createBaseSchema<IAppointmentModel>(
  {
    appointmentId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    studentId: { type: String, required: true },
    scheduledStartAt: { type: Date, required: true },
    scheduledEndAt: { type: Date, required: true },
    appointmentCategory: { type: String, required: true },
    appointmentType: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: [...Object.values(Status)],
      default: 'pending',
    },
    checkInStatus: {
      type: String,
      enum: [...Object.values(CheckInStatus)],
      default: 'not-checked-in',
    },
    checkInTime: { type: Date },
    staffId: { type: String },
    counselorId: { type: String },
    qrCode: {
      token: { type: String, default: null },
      scannedById: { type: String, default: null },
      scannedAt: { type: Date, default: null },
    },
    cancellation: {
      cancelledById: { type: String, default: null },
      reason: { type: String, default: null },
      cancelledAt: { type: Date, default: null },
    },
  },
  {
    modelName: APPOINTMENT_MODEL_NAME,
  },
);

const AppointmentModel = new BaseModel<IAppointmentModel>(
  APPOINTMENT_MODEL_NAME,
  AppointmentSchema,
).getModel();

export default AppointmentModel;

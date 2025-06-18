import { CallbackError, Document, modelNames, Schema } from 'mongoose';
import { IAppointment } from '../types';
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
    scheduleDate: { type: String, required: true },
    scheduleTime: { type: String, required: true },
    appointmentCategory: { type: String, required: true },
    appointmentType: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
    },
    checkInStatus: {
      type: String,
      enum: ['pending', 'checked-in', 'missed'],
      default: 'pending',
    },
    checkInTime: { type: Date },
    staffId: { type: String },
    counselorId: { type: String },
    scheduleId: { type: String },
    qrCodeData: { type: String },
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

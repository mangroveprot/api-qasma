import Joi from 'joi';
import { Status } from '../types';

export const appointmentSchema = Joi.object({
  studentId: Joi.string().required(),
  scheduledStartAt: Joi.date().iso().required(),
  scheduledEndAt: Joi.date().iso().required(),
  appointmentType: Joi.string().required(),
  appointmentCategory: Joi.string().required(),
});

export const updateAppointmentSchema = Joi.object({
  appointmentId: Joi.string().required(),
  studentId: Joi.string().required(),
  scheduledStartAt: Joi.date().iso().required(),
  scheduledEndAt: Joi.date().iso().required(),
  appointmentType: Joi.string().required(),
  appointmentCategory: Joi.string().required(),
});

export const verifyAppointmentSchema = Joi.object({
  appointmentId: Joi.string().required(),
  status: Joi.string().valid(...Object.values(Status)),
  qrCode: Joi.object({
    token: Joi.string().required(),
    scannedById: Joi.date().iso().required(),
    scannedAt: Joi.date().iso().required(),
  }),
});

export const cancelAppointmentSchema = Joi.object({
  appointmentId: Joi.string().required(),
  cancellation: Joi.object({
    cancelledById: Joi.string().required(),
    reason: Joi.string().required(),
    cancelledAt: Joi.date().iso().required(),
  }),
});

export const acceptAppointmentSchema = Joi.object({
  appointmentId: Joi.string().required(),
  staffId: Joi.string().required(),
  studentId: Joi.string().required(),
  counselorId: Joi.string().required(),
  status: Joi.string().valid(...Object.values(Status)),
});

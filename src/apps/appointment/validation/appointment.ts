import Joi from 'joi';
import { Status } from '../types';

export const appointmentSchema = Joi.object({
  studentId: Joi.string().required(),
  scheduledStartAt: Joi.date().iso().required(),
  scheduledEndAt: Joi.date().iso().required(),
  appointmentType: Joi.string().required(),
  appointmentCategory: Joi.string().required(),
  description: Joi.string().optional(),
});

export const verifyAppointmentSchema = Joi.object({
  token: Joi.string().required(),
  appointmentId: Joi.string().required(),
  studentId: Joi.string().required(),
  counselorId: Joi.string().required(),
});

export const updateAppointmentSchema = Joi.object({
  appointmentId: Joi.string().required(),
  studentId: Joi.string().optional(),
  scheduledStartAt: Joi.date().iso().optional(),
  scheduledEndAt: Joi.date().iso().optional(),
  appointmentType: Joi.string().optional(),
  appointmentCategory: Joi.string().optional(),
  description: Joi.string().optional(),
  counselorId: Joi.string().optional(),
  staffId: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
  checkInStatus: Joi.string().optional(),
  feedbackSubmitted: Joi.boolean().optional(),
  reschedule: Joi.object({
    rescheduledBy: Joi.string().optional().allow(null, ''),
    remarks: Joi.string().optional().allow(null, ''),
    rescheduledAt: Joi.date().iso().optional().allow(null),
    previousStart: Joi.date().iso().optional().allow(null),
    previousEnd: Joi.date().iso().optional().allow(null),
  }).optional(),
  qrCode: Joi.object({
    token: Joi.string().required(),
    scannedById: Joi.string().required(),
    scannedAt: Joi.date().iso().required(),
  }).optional(),
  cancellation: Joi.object({
    cancelledById: Joi.string().required(),
    reason: Joi.string().required(),
    cancelledAt: Joi.date().iso().required(),
  }).optional(),
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

export const counselorAvailabilitySchema = Joi.object({
  scheduledStartAt: Joi.date().iso().required(),
  scheduledEndAt: Joi.date().iso().required(),
});

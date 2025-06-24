import Joi from 'joi';
import { Role } from '../../users/types/';

export const studentInfoSchema = Joi.object({
  course: Joi.string().required(),
  yearLevel: Joi.number().integer().required(),
  section: Joi.string().required(),
});

export const counselorInfoSchema = Joi.object({
  specialization: Joi.string().required(),
  roomNumber: Joi.string().required(),
});

export const staffInfoSchema = Joi.object({
  department: Joi.string().required(),
  position: Joi.string().required(),
});

export const registerSchema = Joi.object({
  idNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(Role.Counselor, Role.Staff, Role.Student).required(),
  verified: Joi.boolean().default(false),
  active: Joi.boolean().default(true),
  first_name: Joi.string().required(),
  middle_name: Joi.string().optional().allow('', null),
  last_name: Joi.string().required(),
  suffix: Joi.string().optional().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  date_of_birth: Joi.date().required(),
  contact_number: Joi.string().required(),
  address: Joi.string().optional().allow('', null),
  facebook: Joi.string().optional().allow('', null),
  other_info: Joi.object()
    .when('role', {
      is: Role.Student,
      then: studentInfoSchema.required(),
      otherwise: Joi.forbidden(),
    })
    .when('role', {
      is: Role.Counselor,
      then: counselorInfoSchema.required(),
      otherwise: Joi.forbidden(),
    })
    .when('role', {
      is: Role.Staff,
      then: staffInfoSchema.required(),
      otherwise: Joi.forbidden(),
    }),
}).unknown(false);

export const verifyAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
}).unknown(false);

export const loginSchema = Joi.object({
  idNumber: Joi.string().required(),
  password: Joi.string().min(6).required(),
}).unknown(false);

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
}).unknown(false);

export const resetPasswordSchema = Joi.object({
  code: Joi.string().min(6).required(),
  newPassword: Joi.string().min(8).required(),
})
  .or('idNumber', 'email')
  .unknown(false);

export const emailOrIdSchema = Joi.object({
  idNumber: Joi.string().trim().min(1).optional(),
  email: Joi.string().trim().email().optional(),
})
  .or('idNumber', 'email')
  .unknown(false);

export const logoutSchema = Joi.object({
  accessToken: Joi.string().required(),
  refreshToken: Joi.string().required(),
}).unknown(false);

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
}).unknown(false);

export const generateOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  purpose: Joi.string().required(),
}).unknown(false);

export const validateOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  purpose: Joi.string().required(),
  code: Joi.string().min(6).required(),
}).unknown(false);

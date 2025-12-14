import Joi from 'joi';
import { Role } from '../../users/types/';

export const studentInfoSchema = Joi.object({
  course: Joi.string().optional().allow('', null),
  yearLevel: Joi.number().integer().optional().allow(null),
  block: Joi.string().optional().allow('', null),
});

export const counselorInfoSchema = Joi.object({
  unavailableTimes: Joi.object()
    .pattern(
      Joi.string(),
      Joi.array().items(
        Joi.object({
          start: Joi.string().required(),
          end: Joi.string().required(),
        }),
      ),
    )
    .optional()
    .allow(null),
});

export const registerSchema = Joi.object({
  idNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(Role.Counselor, Role.Staff, Role.Student).required(),
  first_name: Joi.string().required(),
  middle_name: Joi.string().optional().allow('', null),
  last_name: Joi.string().required(),
  suffix: Joi.string().optional().allow('', null),
  gender: Joi.string().lowercase().valid('male', 'female', 'other').required(),
  date_of_birth: Joi.date().required(),
  contact_number: Joi.string().required(),
  address: Joi.string().optional().allow('', null),
  facebook: Joi.string().optional().allow('', null),
  other_info: Joi.alternatives().conditional('role', {
    switch: [
      { is: Role.Student, then: studentInfoSchema.required() },
      { is: Role.Counselor, then: counselorInfoSchema.required() },
      { is: Role.Staff, then: Joi.object({}).optional().allow(null) },
    ],
    otherwise: Joi.forbidden(),
  }),
}).unknown(false);

export const newUser = Joi.object({
  idNumber: Joi.string().required(),
  email: Joi.string().email().optional().allow('', null),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(Role.Counselor, Role.Staff, Role.Student).required(),
  verified: Joi.boolean().required(),
  active: Joi.boolean().required(),
  first_name: Joi.string().optional().allow('', null),
  middle_name: Joi.string().optional().allow('', null),
  last_name: Joi.string().optional().allow('', null),
  suffix: Joi.string().optional().allow('', null),
  gender: Joi.string()
    .lowercase()
    .valid('male', 'female', 'other')
    .optional()
    .allow('', null),
  date_of_birth: Joi.date().optional().allow(null),
  contact_number: Joi.string().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  facebook: Joi.string().optional().allow('', null),
  other_info: Joi.alternatives().conditional('role', {
    switch: [
      { is: Role.Student, then: studentInfoSchema.required() },
      { is: Role.Counselor, then: counselorInfoSchema.required() },
      { is: Role.Staff, then: Joi.object({}).required() },
    ],
    otherwise: Joi.forbidden(),
  }),
}).unknown(false);

export const verifyAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
  purpose: Joi.string().required(),
}).unknown(false);

export const loginSchema = Joi.object({
  idNumber: Joi.string().required(),
  password: Joi.string().min(6).required(),
}).unknown(false);

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
}).unknown(false);

export const resetPasswordSchema = Joi.object({
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

export const changePasswordSchema = Joi.object({
  idNumber: Joi.string().required(),
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
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

export const validateFCMToken = Joi.object({
  fcmToken: Joi.string().required(),
}).unknown(false);

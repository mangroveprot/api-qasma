import Joi from 'joi';

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
  role: Joi.string().valid('student', 'staff', 'counselor').required(),
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

  other_info: Joi.alternatives()
    .conditional('role', {
      is: 'student',
      then: studentInfoSchema.required(),
    })
    .conditional('role', {
      is: 'counselor',
      then: counselorInfoSchema.required(),
    })
    .conditional('role', {
      is: 'staff',
      then: staffInfoSchema.required(),
    }),
});

export const loginSchema = Joi.object({
  idNumber: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  code: Joi.string().min(6).required(),
  newPassword: Joi.string().min(8).required(),
}).or('idNumber', 'email');

export const emailOrIdSchema = Joi.object({
  idNumber: Joi.string().trim().min(1).optional(),
  email: Joi.string().trim().email().optional(),
}).or('idNumber', 'email');

export const logoutSchema = Joi.object({
  accessToken: Joi.string().required(),
  refreshToken: Joi.string().required(),
}).unknown(false);

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
}).unknown(false);

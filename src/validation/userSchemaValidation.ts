import Joi from 'joi';

export const userSchemaValidation = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  middle_initial: Joi.string().max(2).optional(),
  suffix: Joi.string().max(5).optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  date_of_birth: Joi.date().iso().required(),
  address: Joi.string().max(255).optional(),
  contact_number: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required(),
  email: Joi.string().email().required(),
  facebook: Joi.string().uri().optional(),
});

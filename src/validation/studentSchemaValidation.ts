import Joi from 'joi';

export const studentSchemaValidation = Joi.object({
  user_id: Joi.string().required(), // Must be the MongoDB ObjectId of a user
  id_number: Joi.string().min(6).max(15).pattern(/^\d+$/).required(),
  course: Joi.string().min(2).max(100).required(),
  block: Joi.string().max(10).required(),
  year_level: Joi.number().integer().min(1).max(6).required(),
});

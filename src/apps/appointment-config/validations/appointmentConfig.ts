import Joi from 'joi';

export const appointmentConfigSchema = Joi.object({
  session_duration: Joi.number().required(),
  bufferTime: Joi.number().required(),
  reminders: Joi.array().items(Joi.string()).required(),
  categoryAndType: Joi.object()
    .pattern(Joi.string(), Joi.array().items(Joi.string()))
    .required(),
});

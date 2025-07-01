import Joi from 'joi';

export const appointmentConfigSchema = Joi.object({
  session_duration: Joi.number().required(),
  buffer_time: Joi.number().required(),
  booking_lead_time: Joi.number().required(),
  slot_days_range: Joi.number().required(),
  reminders: Joi.array().items(Joi.string()).required(),

  available_day_time: Joi.object()
    .pattern(
      Joi.string(), // Day keys like "Monday", "Tuesday"
      Joi.array().items(
        Joi.object({
          start: Joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required(),
          end: Joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required(),
        }),
      ),
    )
    .optional(),
  category_and_type: Joi.object()
    .pattern(
      Joi.string(),
      Joi.array().items(
        Joi.object({
          type: Joi.string().required(),
          duration: Joi.number().required(),
        }),
      ),
    )
    .required(),
});

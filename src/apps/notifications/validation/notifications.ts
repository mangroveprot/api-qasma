import Joi from 'joi';

export const markAsReadValidation = Joi.object({
  notificationIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.base': 'notificationIds must be an array',
      'array.min': 'notificationIds must contain at least one notification ID',
      'any.required': 'notificationIds is required',
    }),
});

export const deleteNotificationsValidation = Joi.object({
  notificationIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.base': 'notificationIds must be an array',
      'array.min': 'notificationIds must contain at least one notification ID',
      'any.required': 'notificationIds is required',
    }),
});

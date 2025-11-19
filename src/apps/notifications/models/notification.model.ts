import { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel, createBaseSchema, IBaseModel } from '../../../core/engine';
import { INotification, NotificationStatus, NotificationType } from '../types';

const NOTIFICATION_MODEL_NAME = 'Notification';

export interface INotificationModel
  extends INotification,
    IBaseModel,
    Document {}

const NotificationSchema = createBaseSchema<INotificationModel>(
  {
    notificationId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [...Object.values(NotificationType)],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: [...Object.values(NotificationStatus)],
      default: NotificationStatus.Pending,
    },
    sentAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    fcmResponse: {
      success: { type: Boolean },
      messageId: { type: String },
      error: { type: String },
    },
  },
  {
    modelName: NOTIFICATION_MODEL_NAME,
  },
);

NotificationSchema.index({ idNumber: 1, status: 1 });
NotificationSchema.index({ idNumber: 1, createdAt: -1 });

// TTL auto delete notifications
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }, // 90 days in seconds
);

const NotificationModel = new BaseModel<INotificationModel>(
  NOTIFICATION_MODEL_NAME,
  NotificationSchema,
).getModel();

export default NotificationModel;

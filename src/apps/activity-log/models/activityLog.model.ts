import { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel, createBaseSchema, IBaseModel } from '../../../core/engine';

export type ActivityCategory =
  | 'account'
  | 'appointment'
  | 'security'
  | 'system';

export interface IActivityLog extends IBaseModel, Document {
  activityId: string;
  userId?: string | null;
  category: ActivityCategory;
  action: string;
  relatedId?: string | null;
  details: Record<string, any>;
  ipAddress?: string | null;
  device?: string | null;
  userAgent?: string | null;
  platform?: string | null;
  appVersion?: string | null;
}

const ACTIVITY_LOG_MODEL_NAME = 'ActivityLog';

const ActivityLogSchema = createBaseSchema<IActivityLog>(
  {
    activityId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    userId: {
      type: String,
      index: true,
      default: null,
    },
    category: {
      type: String,
      enum: ['account', 'appointment', 'security', 'notification', 'system'],
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    relatedId: {
      type: String,
      default: null,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: { type: String, default: null },
    device: { type: String, default: null },
    userAgent: { type: String, default: null },
    platform: { type: String, default: null },
    appVersion: { type: String, default: null },
  },
  {
    modelName: ACTIVITY_LOG_MODEL_NAME,
  },
);

// performance indexes
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ category: 1, createdAt: -1 });

// retention: 90 days
ActivityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

const ActivityLogModel = new BaseModel<IActivityLog>(
  ACTIVITY_LOG_MODEL_NAME,
  ActivityLogSchema,
).getModel();

export default ActivityLogModel;

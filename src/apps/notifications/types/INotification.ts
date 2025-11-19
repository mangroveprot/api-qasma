import { TNotificationType, TNotificationStatus } from './NotificationType';

export interface INotification {
  notificationId: string;
  idNumber: string;
  type: TNotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  status: TNotificationStatus;
  sentAt?: Date;
  readAt?: Date;
  fcmResponse?: {
    success: boolean;
    messageId?: string;
    error?: string;
  };
}

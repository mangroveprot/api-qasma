import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/engine';
import { INotificationModel } from '../models/notification.model';

export class NotificationRepository extends BaseRepository<INotificationModel> {
  constructor(model: Model<INotificationModel>) {
    super(model);
  }

  async markAsRead(notificationId: string): Promise<INotificationModel | null> {
    return await this.update({ notificationId }, {
      readAt: new Date(),
      status: 'read',
    } as any);
  }

  async markAsSent(
    notificationId: string,
    fcmResponse: { success: boolean; messageId?: string; error?: string },
  ): Promise<INotificationModel | null> {
    return await this.update({ notificationId }, {
      sentAt: new Date(),
      status: fcmResponse.success ? 'sent' : 'failed',
      fcmResponse,
    } as any);
  }
}

export default NotificationRepository;

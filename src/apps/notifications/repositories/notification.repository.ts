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

  async insertMany(
    notifications: Partial<INotificationModel>[],
  ): Promise<INotificationModel[]> {
    return (await this.model.insertMany(
      notifications,
    )) as unknown as INotificationModel[];
  }

  async markManyAsRead(notificationIds: string[]): Promise<number> {
    const result = await this.model.updateMany(
      { notificationId: { $in: notificationIds } },
      {
        $set: {
          readAt: new Date(),
          status: 'read',
        },
      },
    );
    return result.modifiedCount;
  }

  async markManyAsSent(
    updates: Array<{
      notificationId: string;
      fcmResponse: { success: boolean; messageId?: string; error?: string };
    }>,
  ): Promise<void> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { notificationId: update.notificationId },
        update: {
          $set: {
            sentAt: new Date(),
            status: update.fcmResponse.success ? 'sent' : 'failed',
            fcmResponse: update.fcmResponse,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await this.model.bulkWrite(bulkOps);
    }
  }

  async deleteMany(notificationIds: string[]): Promise<number> {
    const result = await this.model.deleteMany({
      notificationId: { $in: notificationIds },
    });
    return result.deletedCount;
  }
}

export default NotificationRepository;

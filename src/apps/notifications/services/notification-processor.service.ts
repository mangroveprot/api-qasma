import { SuccessResponseType } from '../../../common/shared';
import { NotificationModel } from '../models';
import { FCMService } from './index';
import { IUserModel, UserService } from '../../users';
import { NotificationRepository } from '../repositories';

const notificationRepo = new NotificationRepository(NotificationModel);

export class NotificationProcessorService {
  static async processNotification(notificationId: string): Promise<{
    success: boolean;
    messageId?: string;
    reason?: string;
  }> {
    console.info(`Processing notification: ${notificationId}`);

    try {
      const notification = await notificationRepo.findOne({ notificationId });

      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }

      const userResponse = (await UserService.findOne({
        idNumber: notification.idNumber,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new Error(`User not found: ${notification.idNumber}`);
      }

      const user = userResponse.document;

      if (!user.fcmToken) {
        console.warn(
          `User ${notification.idNumber} has no FCM token, skipping notification`,
        );
        await notificationRepo.markAsSent(notificationId, {
          success: false,
          error: 'No FCM token',
        });
        return { success: false, reason: 'No FCM token' };
      }

      const fcmResponse = await FCMService.sendNotification({
        token: user.fcmToken,
        title: notification.title,
        body: notification.body,
        data: {
          notificationId: notification.notificationId,
          type: notification.type,
          ...notification.data,
        },
      });

      await notificationRepo.markAsSent(notificationId, fcmResponse);

      if (fcmResponse.success) {
        console.info(
          `Notification sent successfully: ${notificationId} -> ${fcmResponse.messageId}`,
        );
        return { success: true, messageId: fcmResponse.messageId };
      } else {
        console.error(
          `Failed to send notification: ${notificationId} -> ${fcmResponse.error}`,
        );
        throw new Error(fcmResponse.error);
      }
    } catch (error) {
      console.error(`Error processing notification: ${notificationId}`, error);
      throw error;
    }
  }
}

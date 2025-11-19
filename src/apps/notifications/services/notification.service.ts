import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared';
import { BaseService } from '../../../core/engine';
import { INotificationModel, NotificationModel } from '../models';
import { NotificationRepository } from '../repositories';
import { TNotificationType } from '../types';
import { notificationQueue } from '../queues/notification.queue';
import { logger } from '../../../common/shared';
import moment from 'moment-timezone';
import { config } from '../../../core/config';

class NotificationService extends BaseService<
  INotificationModel,
  NotificationRepository
> {
  constructor() {
    const notificationRepo = new NotificationRepository(NotificationModel);
    super(notificationRepo);
    this.allowedFilterFields = ['status', 'type', 'idNumber'];
  }

  async queueNotification({
    idNumbers,
    type,
    title,
    body,
    data = {},
  }: {
    idNumbers: string[];
    type: TNotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const notifications = await Promise.all(
        idNumbers.map((idNumber) =>
          this.create({
            idNumber,
            type,
            title,
            body,
            data,
            status: 'pending',
          } as any),
        ),
      );

      for (const notification of notifications) {
        if (notification.success && notification.document) {
          await notificationQueue.add('send-notification', {
            notificationId: notification.document.notificationId,
          });
        }
      }

      logger.info(
        `Queued ${notifications.length} notifications of type: ${type}`,
      );

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async markAsRead(
    notificationId: string,
  ): Promise<SuccessResponseType<INotificationModel> | ErrorResponseType> {
    try {
      const notification = await this.repository.markAsRead(notificationId);

      if (!notification) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'Notification not found.');
      }

      return { success: true, document: notification };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }

  async getUserNotifications({
    idNumber,
  }: {
    idNumber: string;
  }): Promise<SuccessResponseType<INotificationModel> | ErrorResponseType> {
    try {
      const thirtyDaysAgo = moment
        .tz(config.timeZone)
        .subtract(30, 'days')
        .toDate();

      const response = await this.findAll({
        query: {
          idNumber,
          createdAt: { $gte: thirtyDaysAgo },
        },
        sort: { createdAt: -1 },
        limit: 100,
        paginate: false,
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('UNKNOWN_ERROR', (error as Error).message),
      };
    }
  }
}

export default new NotificationService();

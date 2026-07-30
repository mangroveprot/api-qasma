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
      const notificationDocs = idNumbers.map((idNumber) => ({
        idNumber,
        type,
        title,
        body,
        data,
        status: 'pending' as const,
      }));

      const insertedNotifications = await this.repository.insertMany(
        notificationDocs,
      );

      await Promise.all(
        insertedNotifications.map((notification) =>
          notificationQueue.add('send-notification', {
            notificationId: notification.notificationId,
          }),
        ),
      );

      logger.info(
        `Queued ${insertedNotifications.length} notifications of type: ${type}`,
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
    idNumber: string,
    notificationIds: string[],
  ): Promise<
    SuccessResponseType<{ modifiedCount: number }> | ErrorResponseType
  > {
    try {
      const notifications = await this.repository.findAll({
        notificationId: { $in: notificationIds },
        idNumber,
      });

      if (notifications.length === 0) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'No notifications found.');
      }

      const foundIds = notifications.map((n) => n.notificationId);

      const modifiedCount = await this.repository.markManyAsRead(foundIds);

      return {
        success: true,
        document: { modifiedCount } as any,
      };
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

  async deleteNotifications(
    idNumber: string,
    notificationIds: string[],
  ): Promise<
    SuccessResponseType<{ deletedCount: number }> | ErrorResponseType
  > {
    try {
      const notifications = await this.repository.findAll({
        notificationId: { $in: notificationIds },
        idNumber,
      });

      if (notifications.length === 0) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'No notifications found.');
      }

      const foundIds = notifications.map((n) => n.notificationId);

      const deletedCount = await this.repository.deleteMany(foundIds);

      return {
        success: true,
        document: { deletedCount } as any,
      };
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

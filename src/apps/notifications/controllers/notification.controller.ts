import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';
import { NotificationService } from '../services';

class NotificationController {
  static async getUserNotifications(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idNumber = (req as any).payload?.aud as string;

      const response = await NotificationService.getUserNotifications({
        idNumber,
      });

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { notificationIds } = req.body;
      const idNumber = (req as any).payload?.aud as string;

      const response = await NotificationService.markAsRead(
        idNumber,
        notificationIds,
      );

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async deleteNotifications(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { notificationIds } = req.body;
      const idNumber = (req as any).payload?.aud as string;

      const response = await NotificationService.deleteNotifications(
        idNumber,
        notificationIds,
      );

      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  static async sync(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { lastSynced } = req.params;
      const { idNumber } = req.query;

      const query = idNumber ? { idNumber: idNumber as string } : {};

      const response = await NotificationService.findAll({
        query,
        lastSynced: lastSynced,
        paginate: false,
      });

      if (response.success) {
        ApiResponse.success(res, response, 200);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

export default NotificationController;

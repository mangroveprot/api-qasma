import { Request, Response, NextFunction } from 'express';
import {
  ApiResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared';
import { ActivityLogService } from '../services';
import { IActivityLog } from '../models';

class ActivityLogController {
  /**
   * Get user's own activity logs (filtered by authenticated user ID)
   * Accessible by: Student, Counselor, Staff
   */
  static async getAllLogsByUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const idNumber = (req as any).payload?.aud as string;
      const response = await ActivityLogService.findAll({
        query: { userId: idNumber },
        sort: { createdAt: -1 },
        ...req.query,
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

  /**
   * Get all activity logs (admin/staff only)
   * Accessible by: Counselor, Staff
   */
  static async getLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await ActivityLogService.findAll({
        ...req.query,
        sort: { createdAt: -1 },
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

  /**
   * Sync activity logs (for mobile app synchronization)
   * Accessible by: All authenticated users
   */
  static async sync(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { lastSynced } = req.params;
      const { userId } = req.query;

      const query = userId ? { userId: userId as string } : {};

      const response = await ActivityLogService.findAll({
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

  static async exportLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        format = 'csv',
        category,
        action,
        start_date,
        end_date,
      } = req.query as any;

      const start = start_date
        ? new Date(start_date)
        : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = end_date ? new Date(end_date) : new Date();

      const response = await ActivityLogService.getActivityLogsByDateRange(
        start.toISOString(),
        end.toISOString(),
        {
          category,
          action,
          paginate: false,
          limit: 10000,
        } as any,
      );

      if (!response.success) {
        throw response;
      }

      const logs =
        (response as SuccessResponseType<IActivityLog>).documents || [];

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="activity-logs.csv"',
        );

        const header = [
          'activity_id',
          'timestamp',
          'user_id',
          'category',
          'action',
          'related_id',
          'details',
          'ip_address',
          'device',
          'platform',
          'app_version',
        ].join(',');

        const rows = logs.map((log: any) =>
          [
            log.activityId,
            log.createdAt?.toISOString?.() || '',
            log.userId || '',
            log.category,
            log.action,
            log.relatedId || '',
            JSON.stringify(log.details || {}),
            log.ipAddress || '',
            log.device || '',
            log.platform || '',
            log.appVersion || '',
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(','),
        );

        res.send([header, ...rows].join('\n'));
      } else {
        ApiResponse.success(res, {
          success: true,
          documents: logs,
        } as any);
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

export default ActivityLogController;

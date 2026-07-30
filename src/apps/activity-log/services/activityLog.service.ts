import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '../../../common/shared';
import { AsyncStorageService } from '../../../common/shared/services';
import { BaseService } from '../../../core/engine';
import { ActivityLogModel, IActivityLog } from '../models';
import { ActivityLogRepository } from '../repositories';
import { FilterQuery } from 'mongoose';

type Metadata = {
  ipAddress?: string | null;
  device?: string | null;
  userAgent?: string | null;
  platform?: string | null;
  appVersion?: string | null;
  [key: string]: any;
};

class ActivityLogService extends BaseService<
  IActivityLog,
  ActivityLogRepository
> {
  constructor() {
    const repo = new ActivityLogRepository(ActivityLogModel);
    super(repo);
    this.allowedFilterFields = ['userId', 'category', 'action'];
  }

  async logGeneric(data: Partial<IActivityLog>): Promise<void> {
    try {
      const requestMetadata = this.getRequestMetadata();

      const enrichedData: Partial<IActivityLog> = {
        ...data,
        ipAddress: data.ipAddress ?? requestMetadata?.ipAddress ?? null,
        userAgent: data.userAgent ?? requestMetadata?.userAgent ?? null,
        device: data.device ?? requestMetadata?.device ?? null,
        platform: data.platform ?? requestMetadata?.platform ?? null,
        appVersion: data.appVersion ?? requestMetadata?.appVersion ?? null,
      };

      await this.repository.create(enrichedData as any);
    } catch (error) {
      console.error('Failed to create activity log', error as any);
    }
  }

  private getRequestMetadata(): Record<string, any> | null {
    try {
      const asyncStorage = AsyncStorageService.getInstance();

      if (!asyncStorage) {
        return null;
      }

      return asyncStorage.get('requestMetadata') ?? null;
    } catch (error) {
      console.error('Failed to retrieve request metadata', error);
      return null;
    }
  }

  // -------- Account --------

  async logProfileUpdate(
    userId: string,
    changes: {
      fieldsChanged: string[];
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
    },
    metadata: Metadata = {},
  ): Promise<void> {
    await this.logGeneric({
      userId,
      category: 'account',
      action: 'profile_updated',
      details: {
        fieldsChanged: changes.fieldsChanged,
        oldValues: changes.oldValues,
        newValues: changes.newValues,
      },
      ...this.mapMetadata(metadata),
    });
  }

  async logEmailChange(
    userId: string,
    oldEmail: string,
    newEmail: string,
    metadata: Metadata = {},
  ): Promise<void> {
    await this.logGeneric({
      userId,
      category: 'account',
      action: 'email_changed',
      details: {
        oldEmail,
        newEmail,
      },
      ...this.mapMetadata(metadata),
    });
  }

  async logPasswordChange(
    userId: string,
    metadata: Metadata = {},
  ): Promise<void> {
    await this.logGeneric({
      userId,
      category: 'account',
      action: 'password_changed',
      details: {},
      ...this.mapMetadata(metadata),
    });
  }

  // -------- Appointments --------

  async logAppointmentReschedule(
    userId: string,
    appointmentId: string,
    oldDate: { start: Date; end: Date },
    newDate: { start: Date; end: Date },
    reason: string | null,
    metadata: Metadata = {},
  ): Promise<void> {
    await this.logGeneric({
      userId,
      relatedId: appointmentId,
      category: 'appointment',
      action: 'appointment_rescheduled',
      details: {
        oldDate,
        newDate,
        reason,
      },
      ...this.mapMetadata(metadata),
    });
  }

  async logAppointmentCancellation(
    userId: string,
    appointmentId: string,
    reason: string | null,
    metadata: Metadata = {},
  ): Promise<void> {
    await this.logGeneric({
      userId,
      relatedId: appointmentId,
      category: 'appointment',
      action: 'appointment_cancelled',
      details: { reason },
      ...this.mapMetadata(metadata),
    });
  }

  // -------- Security --------

  async logLogin(
    userId: string | null,
    success: boolean,
    metadata: Metadata = {},
  ): Promise<void> {
    await this.logGeneric({
      userId: userId || null,
      category: 'security',
      action: success ? 'login_successful' : 'login_failed',
      details: {},
      ...this.mapMetadata(metadata),
    });
  }

  async logFailedLogin(
    identifier: string,
    attemptNumber: number,
    metadata: Metadata = {},
  ): Promise<void> {
    await this.logGeneric({
      userId: null,
      category: 'security',
      action: 'login_failed',
      details: {
        identifier,
        attemptNumber,
      },
      ...this.mapMetadata(metadata),
    });
  }

  // -------- System --------

  async logSystemAction(
    actor: string | null,
    action: string,
    details: Record<string, any>,
    metadata: Metadata = {},
  ): Promise<void> {
    await this.logGeneric({
      userId: actor || null,
      category: 'system',
      action,
      details,
      ...this.mapMetadata(metadata),
    });
  }

  // -------- Queries --------

  async getUserActivityLogs(
    userId: string,
    {
      category,
      action,
      page = 1,
      limit = 50,
      startDate,
      endDate,
    }: {
      category?: string;
      action?: string;
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<SuccessResponseType<IActivityLog> | ErrorResponseType> {
    const query: FilterQuery<IActivityLog> = { userId };

    if (category) query.category = category;
    if (action) query.action = action;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as any).$gte = new Date(startDate);
      if (endDate) (query.createdAt as any).$lte = new Date(endDate);
    }

    return this.findAll({ query, sort: { createdAt: -1 }, page, limit });
  }

  async getActivityLogsByCategory(
    category: string,
    filters: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      action?: string;
      userId?: string;
    },
  ): Promise<SuccessResponseType<IActivityLog> | ErrorResponseType> {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      action,
      userId,
    } = filters;
    const query: FilterQuery<IActivityLog> = { category };

    if (action) query.action = action;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as any).$gte = new Date(startDate);
      if (endDate) (query.createdAt as any).$lte = new Date(endDate);
    }

    return this.findAll({ query, sort: { createdAt: -1 }, page, limit });
  }

  async getActivityLogsByDateRange(
    startDate: string,
    endDate: string,
    filters: {
      category?: string;
      action?: string;
      userId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<SuccessResponseType<IActivityLog> | ErrorResponseType> {
    const { category, action, userId, page = 1, limit = 50 } = filters;
    const query: FilterQuery<IActivityLog> = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (category) query.category = category;
    if (action) query.action = action;
    if (userId) query.userId = userId;

    return this.findAll({ query, sort: { createdAt: -1 }, page, limit });
  }

  // -------- Helpers --------

  private mapMetadata(metadata: Metadata) {
    return {
      ipAddress: metadata.ipAddress || null,
      device: metadata.device || null,
      userAgent: metadata.userAgent || null,
      platform: metadata.platform || null,
      appVersion: metadata.appVersion || null,
    };
  }
}

export default new ActivityLogService();

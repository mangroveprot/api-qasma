import { Request, Response, NextFunction } from 'express';
import { BackupService } from '../services';
import { ApiResponse, ErrorResponseType } from '../../../common/shared';

class BackupController {
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const secret = req.headers['x-backup-secret'] as string;
      const response = await BackupService.create(secret);
      if (response.success) {
        ApiResponse.success(res, response, 201);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}

export default BackupController;

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
  GoogleDriveService,
} from '../../../common/shared';
import { config } from '../../../core/config';
import { getDateTime } from '../../../helpers';
import moment from 'moment';

class BackupService {
  private runMongoDump(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = `mongodump --uri="${config.db.mongoose.uri}" --archive="${filePath}" --gzip`;

      exec(command, (error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }

  async create(
    secret: string,
  ): Promise<
    | SuccessResponseType<{ fileId: string; fileName: string }>
    | ErrorResponseType
  > {
    try {
      if (secret !== config.backup.secret) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid backup secret.');
      }

      const date = moment.tz(config.timeZone).format('YYYYMMDDHHmmss');
      const fileName = `backup-${date}.gz`;
      const filePath = path.join('/tmp', fileName);

      await this.runMongoDump(filePath);

      const fileId = await GoogleDriveService.uploadFile(filePath, fileName);

      fs.unlinkSync(filePath);

      return {
        success: true,
        document: { fileId, fileName },
      };
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
}

export default new BackupService();

import bcrypt from 'bcryptjs';
import { ApiResponse, ErrorResponse } from '../utils';
import { logger } from './logger.service';
import { config } from '../../../core/config';
import { redis as redisInstance } from '../../../core/framework/databases/redis';
import { stringifyObject } from '../../../helpers';

redisInstance.init();
const client = redisInstance.getClient();

class QRCodeService {
  private redisTokenExpire: number;
  private saltRounds: number;

  constructor() {
    this.redisTokenExpire = config.redis.tokenExpireTime;
    this.saltRounds = config.saltRounds;
  }

  async hashQRData(payload: any): Promise<string> {
    try {
      const objToString = stringifyObject(payload);
      const token = await bcrypt.hash(objToString, this.saltRounds);
      return token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async verifyQRToken(payload: any, qrToken: string): Promise<any> {
    try {
      // Check if the qr token is blacklisted
      const result = await new Promise((resolve, reject) => {
        if (!qrToken) {
          reject(
            new ErrorResponse(
              'BAD_REQUEST',
              'Missing QR token or no (payload).',
            ),
          );
        }
        client.get(`bl_${payload.appointmentId}`, (err: any, res: any) => {
          if (err) {
            logger.error(err.message, err);
            return reject(
              new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                'Internal Server Error',
              ),
            );
          }
          resolve(res);
        });
      });

      if (result) {
        const errorResponse = new ErrorResponse(
          'FORBIDDEN',
          'QR token has been already verified.',
        );
        throw errorResponse;
      }

      const objToString = stringifyObject(payload);

      // Compare the stringified payload with the qrToken
      const isMatch = await bcrypt.compare(objToString, qrToken);
      if (!isMatch) {
        throw new ErrorResponse('UNAUTHORIZED', 'Data did not match.');
      }

      return {
        success: isMatch,
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

export default new QRCodeService();

import { ErrorResponse, logger } from '../common/shared';
import { config } from '../core/config';
import { redis as redisInstance } from '../core/framework/databases';
redisInstance.init();
const client = redisInstance.getClient();
const redisTokenExpire = config.redis.tokenExpireTime;
const blacklistExpire = config.redis.blacklistExpireTime;

export function removeFromRedis(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.del(key, (redisErr: any) => {
      if (redisErr) {
        logger.error(redisErr.message, redisErr);
        const errorResponse = new ErrorResponse(
          'INTERNAL_SERVER_ERROR',
          'Internal Server Error',
        );
        return reject(errorResponse);
      }
      resolve();
    });
  });
}

export function setBlackListed(value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.set(
      `bl_${value}`,
      'blacklisted',
      'EX',
      blacklistExpire,
      (redisErr: any) => {
        if (redisErr) {
          logger.error(redisErr.message, redisErr);
          const errorResponse = new ErrorResponse(
            'INTERNAL_SERVER_ERROR',
            'Internal Server Error',
          );
          return reject(errorResponse);
        }
        resolve();
      },
    );
  });
}
export function setFromRedis(key: string, value: string): Promise<any> {
  return new Promise((resolve, reject) => {
    client.set(key, value, 'EX', redisTokenExpire, (redisErr: any) => {
      if (redisErr) {
        logger.error(redisErr.message, redisErr);
        const errorResponse = new ErrorResponse(
          'INTERNAL_SERVER_ERROR',
          'Internal Server Error',
        );
        return reject(errorResponse);
      }
      resolve(value);
    });
  });
}

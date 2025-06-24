import { redis } from '../../../core/framework/databases/redis';
import { config } from '../../../core/config';
import Redis from 'ioredis';

redis.init();
const client: Redis = redis.getClient();

class RedisService {
  public client: Redis;
  private tokenExpireTime: number;
  private blacklistExpireTime;

  constructor() {
    this.client = client;
    this.tokenExpireTime = config.redis.tokenExpireTime;
    this.blacklistExpireTime = config.redis.blacklistExpireTime;
  }

  async storeInRedis(key: string, value: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.set(
        key,
        value,
        'EX',
        this.tokenExpireTime,
        (redisErr, reply) => {
          if (redisErr) {
            return reject(redisErr);
          }
          resolve(value);
        },
      );
    });
  }

  removeFromRedis(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      client.del(key, (redisErr: any) => {
        if (redisErr) {
          return reject(redisErr);
        }
        resolve();
      });
    });
  }

  setBlacklistedInRedis(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      client.set(
        `bl_${token}`,
        'blacklisted',
        'EX',
        this.blacklistExpireTime,
        (redisErr: any) => {
          if (redisErr) {
            return reject(redisErr);
          }
          resolve();
        },
      );
    });
  }

  isBlacklistedInRedis(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.get(`bl_${token}`, (redisErr, result) => {
        if (redisErr) {
          return reject(redisErr);
        } else {
          resolve(result === 'blacklisted');
        }
      });
    });
  }
}

export default new RedisService();

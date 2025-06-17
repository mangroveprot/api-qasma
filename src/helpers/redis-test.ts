import { DB } from '../core/framework';
import { logger } from '../common/shared';

async function testRedisConnection(): Promise<void> {
  try {
    const redis = DB.redis;
    redis.init();
    const client = redis.getClient();
    await client.ping();
    logger.info('Redis is successfully connected and working.');
  } catch (error) {
    logger.error('Redis connection error:', error as Error);
    throw error;
  }
}

export { testRedisConnection };

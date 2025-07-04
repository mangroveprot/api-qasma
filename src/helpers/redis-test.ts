import { DB } from '../core/framework';
import { logger } from '../common/shared';
import { config } from '../core/config';

async function testRedisConnection(): Promise<void> {
  try {
    const redis = DB.redis;
    redis.init();
    const client = redis.getClient();
    await client.ping();
    console.info(
      `Redis is successfully connected to ${config.redis.host} and working.`,
    );
  } catch (error) {
    logger.error('Redis connection error:', error as Error);
    throw error;
  }
}

export { testRedisConnection };

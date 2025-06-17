import { databasesConnectionSelection } from './db-connection-selection';
import { testRedisConnection } from './redis-test';

async function initServices() {
  await databasesConnectionSelection();
  await testRedisConnection();
}

export { initServices };

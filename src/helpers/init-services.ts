import { databasesConnectionSelection } from './db-connection-selection';
import { testNotificationWorker } from './notitfication-worker-test';
import { testRedisConnection } from './redis-test';

async function initServices() {
  await databasesConnectionSelection();
  await testRedisConnection();
  await testNotificationWorker();
}

export { initServices };

import { cronTest } from './cron-test';
import { databasesConnectionSelection } from './db-connection-selection';
import { testNotificationWorker } from './notitfication-worker-test';
import { testRedisConnection } from './redis-test';
import {
  registerAuthActivityListeners,
  registerAppointmentActivityListeners,
} from '../apps/activity-log/listeners';
import { testGoogleDriveConnection } from './google-drive-test';

async function initServices() {
  await databasesConnectionSelection();
  await testRedisConnection();
  await testNotificationWorker();
  await testGoogleDriveConnection();
  registerAuthActivityListeners();
  registerAppointmentActivityListeners();
  // registerUserActivityListeners();

  // await cronTest();
}

export { initServices };

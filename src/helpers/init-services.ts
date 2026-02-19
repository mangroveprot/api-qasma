import { cronTest } from './cron-test';
import { databasesConnectionSelection } from './db-connection-selection';
import { testNotificationWorker } from './notitfication-worker-test';
import { testRedisConnection } from './redis-test';
import {
  registerAuthActivityListeners,
  registerAppointmentActivityListeners,
  registerUserActivityListeners,
} from '../apps/activity-log/listeners';

async function initServices() {
  await databasesConnectionSelection();
  await testRedisConnection();
  await testNotificationWorker();

  // Register activity-log listeners so domain events (auth, appointment, user)
  // are written to the activity log. Called once at startup.
  registerAuthActivityListeners();
  registerAppointmentActivityListeners();
  registerUserActivityListeners();

  // await cronTest();
}

export { initServices };

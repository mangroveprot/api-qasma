import { NotificationWorker } from '../apps/notifications';
import { Workers } from '../core/framework';

async function testNotificationWorker(): Promise<void> {
  try {
    await NotificationWorker.init();

    if (Workers.workerManager.isWorkerRunning('notifications')) {
      console.info('✓ Notification worker is running and connected to BullMQ.');
      console.info(
        'Notification worker is ready to process jobs from the queue.',
      );
    } else {
      throw new Error('Worker failed to start');
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Notification worker initialization error:', err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    throw error;
  }
}

export { testNotificationWorker };

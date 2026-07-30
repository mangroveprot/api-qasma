import { Job } from 'bullmq';
import { Workers } from '../../../core/framework';
import { NotificationProcessorService } from '../services';

const QUEUE_NAME = 'notifications';

async function init(): Promise<void> {
  if (Workers.workerManager.isWorkerRunning(QUEUE_NAME)) {
    console.info('Notification worker already running');
    return;
  }

  const worker = Workers.workerManager.registerWorker(
    QUEUE_NAME,
    async (job: Job) => {
      const { notificationId } = job.data;

      return await NotificationProcessorService.processNotification(
        notificationId,
      );
    },
    { concurrency: 5 },
  );

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Worker connection timeout'));
    }, 10000);

    worker.on('ready', () => {
      clearTimeout(timeout);
      console.info('Notification worker initialized and ready');
      resolve();
    });

    worker.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

function getWorker() {
  return Workers.workerManager.getWorker(QUEUE_NAME);
}

async function close(): Promise<void> {
  await Workers.workerManager.closeWorker(QUEUE_NAME);
}

export { init, getWorker, close };

import { Queue, DefaultJobOptions } from 'bullmq';
import { Workers } from '../../../core/framework';

let notificationQueueInstance: Queue | null = null;

const queueOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: {
    age: 24 * 3600,
    count: 1000,
  },
  removeOnFail: {
    age: 7 * 24 * 3600,
  },
};

function getQueue(): Queue {
  if (!notificationQueueInstance) {
    notificationQueueInstance = Workers.workerManager.getQueue(
      'notifications',
      queueOptions,
    );
    console.info('Notification queue initialized');
  }
  return notificationQueueInstance;
}

export const notificationQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getQueue();
    const value = (queue as any)[prop];
    return typeof value === 'function' ? value.bind(queue) : value;
  },
});

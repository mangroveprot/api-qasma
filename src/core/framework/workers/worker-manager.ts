import { Worker, Job, Queue, DefaultJobOptions } from 'bullmq';
import { config } from '../../config';

type JobHandler = (job: Job) => Promise<any>;

class WorkerManager {
  private workers: Map<string, Worker> = new Map();
  private queues: Map<string, Queue> = new Map();

  registerWorker(
    queueName: string,
    handler: JobHandler,
    options?: { concurrency?: number },
  ): Worker {
    if (this.workers.has(queueName)) {
      console.warn(`Worker for queue "${queueName}" already registered`);
      return this.workers.get(queueName)!;
    }

    const worker = new Worker(queueName, handler, {
      connection: config.bullmq.connection,
      concurrency: options?.concurrency || 5,
    });

    worker.on('completed', (job) => {
      console.info(`[${queueName}] Job ${job.id} completed`);
    });

    worker.on('failed', async (job, err) => {
      if (!job) return;

      console.error(
        `[${queueName}] Job ${job.id} failed after ${job.attemptsMade} attempts:`,
        err,
      );

      // If max attempts reached, permanently remove the job
      const maxAttempts = job.opts.attempts || 3;
      if (job.attemptsMade >= maxAttempts) {
        console.error(
          `[${queueName}] Job ${job.id} exceeded max attempts (${maxAttempts}). Removing from queue.`,
        );

        try {
          await job.remove();
          console.info(`[${queueName}] Job ${job.id} permanently removed`);
        } catch (removeErr) {
          console.error(
            `[${queueName}] Failed to remove job ${job.id}:`,
            removeErr,
          );
        }
      }
    });

    worker.on('error', (err) => {
      console.error(`[${queueName}] Worker error:`, err);
    });

    this.workers.set(queueName, worker);
    console.info(`Worker registered for queue: ${queueName}`);

    return worker;
  }

  getQueue(queueName: string, jobOptions?: DefaultJobOptions): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: config.bullmq.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: true, // CHANGED: Auto-remove failed jobs after max attempts
          ...jobOptions,
        },
      });

      queue.on('error', (error) => {
        console.error(`[${queueName}] Queue error:`, error);
      });

      this.queues.set(queueName, queue);
      console.info(`Queue initialized: ${queueName}`);
    }
    return this.queues.get(queueName)!;
  }

  getWorker(queueName: string): Worker {
    const worker = this.workers.get(queueName);
    if (!worker) {
      throw new Error(
        `Worker for queue "${queueName}" not found. Call registerWorker() first.`,
      );
    }
    return worker;
  }

  isWorkerRunning(queueName: string): boolean {
    const worker = this.workers.get(queueName);
    return worker ? worker.isRunning() : false;
  }

  async closeWorker(queueName: string): Promise<void> {
    const worker = this.workers.get(queueName);
    if (worker) {
      await worker.close();
      this.workers.delete(queueName);
      console.info(`Worker closed: ${queueName}`);
    }
  }

  async closeAll(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    for (const [queueName, worker] of this.workers.entries()) {
      closePromises.push(
        worker.close().then(() => {
          console.info(`Worker closed: ${queueName}`);
        }),
      );
    }
    this.workers.clear();

    for (const [queueName, queue] of this.queues.entries()) {
      closePromises.push(
        queue.close().then(() => {
          console.info(`Queue closed: ${queueName}`);
        }),
      );
    }
    this.queues.clear();

    await Promise.all(closePromises);
  }
}

export const workerManager = new WorkerManager();

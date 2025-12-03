import cron, { ScheduledTask } from 'node-cron';
import { logger } from '../../../common/shared/services';

interface CronJob {
  name: string;
  schedule: string;
  task: () => void | Promise<void>;
  scheduled?: boolean;
  timezone?: string;
}

let cronTasks: Map<string, ScheduledTask> | null = null;
let isInitialized = false;

function init(): void {
  if (isInitialized) {
    logger.warn('Cron manager already initialized');
    return;
  }

  cronTasks = new Map<string, ScheduledTask>();
  isInitialized = true;
  logger.info('Cron manager initialized...');

  process.on('SIGINT', () => {
    logger.info('Shutting down cron jobs...');
    shutdown();
  });

  process.on('SIGTERM', () => {
    logger.info('Shutting down cron jobs...');
    shutdown();
  });
}

function register(job: CronJob): void {
  if (!isInitialized || !cronTasks) {
    throw new Error('Cron manager not initialized. Call init() first.');
  }

  if (cronTasks.has(job.name)) {
    logger.warn(`Cron job "${job.name}" already registered. Skipping.`);
    return;
  }

  try {
    const task = cron.schedule(
      job.schedule,
      async () => {
        try {
          logger.info(
            `[${new Date().toISOString()}] Running cron job: ${job.name}`,
          );
          await job.task();
        } catch (error) {
          logger.error(`Error in cron job "${job.name}":`, error as Error);
        }
      },
      {
        timezone: job.timezone,
      } as any,
    );

    if (job.scheduled === false) {
      task.stop();
    }

    cronTasks.set(job.name, task);
    logger.info(`Cron job registered: ${job.name} (${job.schedule})`);
  } catch (error) {
    logger.error(`Failed to register cron job "${job.name}":`, error as Error);
    throw error;
  }
}

function start(name: string): void {
  if (!cronTasks) {
    throw new Error('Cron manager not initialized. Call init() first.');
  }

  const task = cronTasks.get(name);
  if (!task) {
    throw new Error(`Cron job "${name}" not found`);
  }
  task.start();
  logger.info(`Cron job started: ${name}`);
}

function stop(name: string): void {
  if (!cronTasks) {
    throw new Error('Cron manager not initialized. Call init() first.');
  }

  const task = cronTasks.get(name);
  if (!task) {
    throw new Error(`Cron job "${name}" not found`);
  }
  task.stop();
  logger.info(`Cron job stopped: ${name}`);
}

function remove(name: string): void {
  if (!cronTasks) {
    throw new Error('Cron manager not initialized. Call init() first.');
  }

  const task = cronTasks.get(name);
  if (!task) {
    throw new Error(`Cron job "${name}" not found`);
  }
  task.stop();
  cronTasks.delete(name);
  logger.info(`Cron job removed: ${name}`);
}

function getTasks(): string[] {
  if (!cronTasks) {
    return [];
  }
  return Array.from(cronTasks.keys());
}

function shutdown(): void {
  if (!cronTasks) {
    logger.warn('No cron jobs to shutdown');
    return;
  }

  logger.info('Stopping all cron jobs...');
  cronTasks.forEach((task, name) => {
    task.stop();
    logger.info(`Stopped: ${name}`);
  });
  cronTasks.clear();
  cronTasks = null;
  isInitialized = false;
  logger.info('All cron jobs stopped.');
}

export { init, register, start, stop, remove, getTasks, shutdown };
export type { CronJob };

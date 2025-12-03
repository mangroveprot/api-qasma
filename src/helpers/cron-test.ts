import { AppointmentService } from '../apps/appointment/services';
import { logger } from '../common/shared';
import { config } from '../core/config';
import { CronManager } from '../core/framework';

async function cronTest(): Promise<void> {
  if (config.runningProd) return;
  try {
    CronManager.cron.init();

    CronManager.cron.register({
      name: 'appointment-reminder',
      schedule: '0 */5 * * * *',
      task: async () => {
        await AppointmentService.sendAppointmentReminders();
      },
      scheduled: true,
      timezone: 'Asia/Manila',
    });

    setTimeout(() => {
      // CronManager.cron.stop('test-job');
    }, 30000);
  } catch (error) {
    logger.error('Cron manager initialization error:', error as Error);
    throw error;
  }
}

export { cronTest };

import { Router } from 'express';
import { AuthRoutes, OTPRoutes } from '../../apps/auth/routes';
import { UserRoutes } from '../../apps/users';
import { AppointmentRoute } from '../../apps/appointment/routes';
import { AppointmentConfigRoutes } from '../../apps/appointment-config/routes';
import { NotificationRoutes } from '../../apps/notifications/routes';
import { ActivityLogRoutes } from '../../apps/activity-log/routes';
import { BackupRoutes } from '../../apps/backup/routes';

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/user', UserRoutes);
router.use('/otp', OTPRoutes);
router.use('/appointment', AppointmentRoute);
router.use('/config', AppointmentConfigRoutes);
router.use('/notifications', NotificationRoutes);
router.use('/activity-logs', ActivityLogRoutes);
router.use('/backup', BackupRoutes);

export default router;

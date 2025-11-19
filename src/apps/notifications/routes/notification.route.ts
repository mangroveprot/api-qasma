import { Router } from 'express';
import { NotificationController } from '../controllers';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
} from '../../../common/shared';
import { Role } from '../../users';

const router = Router();

router.get(
  '/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student, Role.Counselor, Role.Staff),
  NotificationController.getUserNotifications,
);

router.get(
  '/sync/:lastSynced/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student, Role.Counselor, Role.Staff),
  NotificationController.sync,
);

// Mark notification as read
router.patch(
  '/:notificationId/read/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student, Role.Counselor, Role.Staff),
  NotificationController.markAsRead,
);

export default router;

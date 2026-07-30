import { Router } from 'express';
import { NotificationController } from '../controllers';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
  validate,
} from '../../../common/shared';
import { Role } from '../../users';
import {
  deleteNotificationsValidation,
  markAsReadValidation,
} from '../validation/notifications';

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

router.patch(
  '/read/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student, Role.Counselor, Role.Staff),
  validate(markAsReadValidation),
  NotificationController.markAsRead,
);

router.delete(
  '/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student, Role.Counselor, Role.Staff),
  validate(deleteNotificationsValidation),
  NotificationController.deleteNotifications,
);

export default router;

import { Router } from 'express';
import ActivityLogController from '../controllers/activityLog.controller';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
} from '../../../common/shared';
import { Role } from '../../users/types/user';

const router = Router();

router.get(
  '/getAllByUser/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Student, Role.Counselor, Role.Staff),
  ActivityLogController.getAllLogsByUser,
);

router.get('/', ActivityLogController.getLogs);

router.get(
  '/sync/:lastSynced/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff, Role.Student),
  ActivityLogController.sync,
);

router.get(
  '/export',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff),
  ActivityLogController.exportLogs,
);

export default router;

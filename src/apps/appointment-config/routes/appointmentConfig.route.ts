import { Router } from 'express';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
  validate,
} from '../../../common/shared';

import { Role } from '../../users';
import { appointmentConfigSchema } from '../validations';
import AppointmentConfigController from '../controllers/appointmentConfig.controller';

const router = Router();

router.post(
  '/create',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor),
  validate(appointmentConfigSchema),
  AppointmentConfigController.createConfig,
);

router.patch(
  '/update',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor),
  AppointmentConfigController.updateConfig,
);

router.get(
  '/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor),
  AppointmentConfigController.getAllConfig,
);

export default router;

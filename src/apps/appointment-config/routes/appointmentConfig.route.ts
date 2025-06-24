import { Router } from 'express';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
  validate,
} from '../../../common/shared';

import { Role } from '../../users';
import { appointmentConfigSchema } from '../validations';

const router = Router();

router.post(
  '/create',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor),
  validate(appointmentConfigSchema),
);

router.patch(
  '/update',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor),
);

export default router;

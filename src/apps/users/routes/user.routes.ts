import { Router } from 'express';
import { UserController } from '../controllers';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
  validate,
  parseQueryMiddleware,
} from '../../../common/shared';
import {
  newUser,
  registerSchema,
  validateFCMToken,
} from '../../auth/validators/auth';
import { Role } from '../types/user';

const router = Router();

router.post(
  '/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff),
  validate(newUser),
  UserController.createUser,
);

router.get(
  '/',
  parseQueryMiddleware,
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff),
  UserController.getAllUsers,
);

router.get(
  '/getProfile/:idNumber',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff),
  UserController.getUserProfile,
);

router.get('/isRegister/:identifier', UserController.isRegister);

router.get(
  '/current',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff, Role.Student),
  UserController.getCurrentUser,
);

router.get(
  '/isActive',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff, Role.Student),
  UserController.isActive,
);

router.get('/sync/:lastSynced/', UserController.sync);

router.post(
  '/fcm-token',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff, Role.Student),
  validate(validateFCMToken),
  UserController.updateFcmToken,
);

export default router;

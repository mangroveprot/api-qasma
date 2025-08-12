import { Router } from 'express';
import { UserController } from '../controllers';
import {
  authenticateAndAttachUserContext,
  authorizeRoles,
  validate,
} from '../../../common/shared';
import { registerSchema } from '../../auth/validators/auth';
import { Role } from '../types/user';

const router = Router();

router.post(
  '/',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff),
  validate(registerSchema),
  UserController.createUser,
);

router.get(
  '/',
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
  '/sync/:lastSynced/:idNumber?',
  authenticateAndAttachUserContext,
  authorizeRoles(Role.Counselor, Role.Staff, Role.Student),
  UserController.sync,
);

export default router;

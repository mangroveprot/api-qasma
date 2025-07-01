import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import {
  authenticateAndAttachUserContext,
  attachUserToContext,
  validate,
} from '../../../common/shared';
import {
  emailOrIdSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyAccountSchema,
} from '../validators/auth';

const router = Router();

router.post(
  '/register',
  attachUserToContext,
  validate(registerSchema),
  AuthController.register,
);

router.post(
  '/verify',
  attachUserToContext,
  validate(verifyAccountSchema),
  AuthController.verifyAccount,
);

router.post('/login', validate(loginSchema), AuthController.login);

router.patch(
  '/update',
  authenticateAndAttachUserContext,
  // validate(loginSchema), // TODO: Add update schemas
  AuthController.updateProfile,
);

router.patch(
  '/reset-password',
  validate(emailOrIdSchema, resetPasswordSchema),
  AuthController.resetPassword,
);

router.post(
  '/forgot-password',
  validate(emailOrIdSchema),
  AuthController.forgotPassword,
);

router.post('/logout', validate(logoutSchema), AuthController.logout);

router.post('/refresh', validate(refreshSchema), AuthController.refreshToken);

export default router;

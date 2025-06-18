import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { validate } from '../../../common/shared';
import {
  emailOrIdSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);

router.post('/login', validate(loginSchema), AuthController.login);

router.post(
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

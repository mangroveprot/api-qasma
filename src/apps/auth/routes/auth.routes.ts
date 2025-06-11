import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/reset-password', AuthController.resetPassword);
router.post('/forgot-password', AuthController.forgotPassword);

export default router;

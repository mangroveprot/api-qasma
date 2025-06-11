import { Router } from 'express';
import { AuthRoutes, OTPRoutes } from '../../apps/auth/routes';
import { UserRoutes } from '../../apps/users';

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/user', UserRoutes);
router.use('/otp', OTPRoutes);

export default router;

import { Router } from 'express';
import { AuthRoutes, OTPRoutes } from '../../apps/auth/routes';
import { UserRoutes } from '../../apps/users';
import { AppointmentRoute } from '../../apps/appointment/routes';

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/user', UserRoutes);
router.use('/otp', OTPRoutes);
router.use('/appointment', AppointmentRoute);

export default router;

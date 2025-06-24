import { Router } from 'express';
import { OTPController } from '../controllers';
import { validate } from '../../../common/shared';
import {
  generateOTPSchema,
  loginSchema,
  validateOTPSchema,
} from '../validators/auth';

const router = Router();

router.post(
  '/generate',
  validate(generateOTPSchema),
  OTPController.generateOTP,
);
router.post(
  '/validate',
  validate(validateOTPSchema),
  OTPController.validateOTP,
);

export default router;

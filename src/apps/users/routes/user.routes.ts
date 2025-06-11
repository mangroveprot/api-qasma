import { Router } from 'express';
import { UserController } from '../controllers';

const router = Router();

router.get('/', UserController.getAllUsers);
router.get('/getProfile/:idNumber', UserController.getUserProfile);
router.get('/getUserById/:uid', UserController.getUserById);

export default router;

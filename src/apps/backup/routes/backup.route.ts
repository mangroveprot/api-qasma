import { Router } from 'express';
import { BackupController } from '../controllers';

const router = Router();

router.get('/', BackupController.create);

export default router;

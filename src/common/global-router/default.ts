import { Router } from 'express';
import { ApiResponse } from '../shared';

const router = Router();

router.get('/', (req, res) => {
  ApiResponse.success(res, { success: true }, 200);
});
router.get('/favicon.ico', (req, res) => {
  ApiResponse.success(res, { success: true }, 200);
});

export default router;

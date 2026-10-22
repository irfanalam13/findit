
import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getMyReports,
} from '../controllers/profileController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.get('/me/reports', getMyReports);

export default router;

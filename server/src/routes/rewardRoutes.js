import { Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.js';
import { getMyRewards } from '../controllers/rewardController.js';

const router = Router();

router.use(requireAuth);

router.get('/me', getMyRewards);

export default router;
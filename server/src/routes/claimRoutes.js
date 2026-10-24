
import { Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.js';
import {
  createClaim,
  reviewClaim,
} from '../controllers/claimController.js';

const router = Router();

router.use(requireAuth);

router.post('/', createClaim);
router.patch('/:id/review', reviewClaim);

export default router;

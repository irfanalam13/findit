
import { Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.js';
import {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  reviewClaim,
} from '../controllers/claimController.js';

const router = Router();

// All claim routes require an authenticated, verified user.
router.use(requireAuth);

router.post('/', createClaim);
router.get('/mine', getMyClaims);
router.get('/received', getReceivedClaims);
router.patch('/:id/review', reviewClaim);

export default router;

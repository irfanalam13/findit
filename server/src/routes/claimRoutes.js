
import { Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.js';
import {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  requestReconsideration,
  reviewClaim,
  confirmReturn,
} from '../controllers/claimController.js';

const router = Router();

router.use(requireAuth);

router.post('/', createClaim);
router.get('/mine', getMyClaims);
router.get('/received', getReceivedClaims);

router.post('/:id/reconsider', requestReconsideration);
router.patch('/:id/review', reviewClaim);

router.post('/:id/confirm-return', confirmReturn);

export default router;

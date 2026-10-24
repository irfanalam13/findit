import { Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

import {
  getAdminOverview,
  getAdminUsers,
  getAdminReports,
  getAdminClaims,
  setReportVisibility,
  setUserSuspension,
} from '../controllers/adminController.js';

const router = Router();

// Every route in this module requires authentication and admin access.
router.use(requireAuth, requireAdmin);

router.get('/overview', getAdminOverview);

router.get('/users', getAdminUsers);
router.patch('/users/:id/suspension', setUserSuspension);

router.get('/reports', getAdminReports);
router.patch('/reports/:id/visibility', setReportVisibility);

router.get('/claims', getAdminClaims);

export default router;
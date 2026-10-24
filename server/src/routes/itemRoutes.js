
import { Router } from 'express';

import {
  getItems,
  createItem,
} from '../controllers/itemController.js';

import { getItemMatches } from '../controllers/matchController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Public: browse active reports.
router.get('/', getItems);

// Private: view potential matches for your own report.
router.get('/:id/matches', requireAuth, getItemMatches);

// Private: create a report.
router.post('/', requireAuth, createItem);

export default router;
















// import express from 'express'
// import { Router } from 'express'
// import {
//   getItems,
//   createItem,
// } from '../controllers/itemController.js'
// import {requireAuth} from '../middleware/requireAuth.js';

// const router = express.Router();

// // Public: browse and search reports.
// router.get('/', getItems);

// // Private: create a report only with a verified login session.
// router.post('/', requireAuth, createItem);

// export default router;

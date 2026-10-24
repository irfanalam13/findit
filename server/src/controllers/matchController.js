
import mongoose from 'mongoose';

import { findMatches } from '../services/matchingService.js';

export async function getItemMatches(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID.',
      });
    }

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to view match suggestions.',
      });
    }

    const matches = await findMatches(id, req.user._id);

    return res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    if ([400, 403, 404].includes(error.status)) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
}

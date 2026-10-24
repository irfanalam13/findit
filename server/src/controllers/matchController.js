
import { findMatches } from '../services/matchingService.js';

export async function getItemMatches(req, res, next) {
  try {
    const matches = await findMatches(
      req.params.id,
      req.user._id,
    );

    return res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    if ([403, 404].includes(error.status)) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
}


import User from '../models/User.js';
import Item from '../models/Item.js';

function serializeProfile(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username || '',
    bio: user.bio || '',
    city: user.city || '',
    avatarUrl: user.avatarUrl || '',
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

export async function getMyProfile(req, res) {
  return res.json({
    success: true,
    profile: serializeProfile(req.user),
  });
}

export async function updateMyProfile(req, res, next) {
  try {
    const allowed = ['name', 'username', 'bio', 'city'];
    const updates = {};

    for (const field of allowed) {
      if (req.body[field] === undefined) continue;

      if (typeof req.body[field] !== 'string') {
        return res.status(400).json({
          success: false,
          message: `${field} must be a string.`,
        });
      }

      updates[field] = req.body[field].trim();
    }

    if (
      updates.name !== undefined &&
      (updates.name.length < 2 || updates.name.length > 80)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name must be 2–80 characters.',
      });
    }

    if (updates.username !== undefined) {
      updates.username = updates.username.toLowerCase();

      if (!/^[a-z0-9_]{3,24}$/.test(updates.username)) {
        return res.status(400).json({
          success: false,
          message:
            'Username must be 3–24 characters using letters, numbers, and underscores.',
        });
      }
    }

    if (updates.bio !== undefined && updates.bio.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Bio cannot exceed 300 characters.',
      });
    }

    if (updates.city !== undefined && updates.city.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'City cannot exceed 100 characters.',
      });
    }

    Object.assign(req.user, updates);
    await req.user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: serializeProfile(req.user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'That username is already taken.',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Please check your profile details.',
      });
    }

    return next(error);
  }
}

export async function getMyReports(req, res, next) {
  try {
    const reports = await Item.find({
      reportedBy: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    return next(error);
  }
}

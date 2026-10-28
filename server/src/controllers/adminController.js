import mongoose from 'mongoose';

import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Reward from '../models/Reward.js';

const MAX_LIMIT = 100;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getLimit(value) {
  const limit = Number.parseInt(value, 10);

  if (!Number.isFinite(limit) || limit < 1) {
    return 50;
  }

  return Math.min(limit, MAX_LIMIT);
}

export async function getAdminOverview(req, res, next) {
  try {
    const [
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      totalReports,
      activeReports,
      hiddenReports,
      lostReports,
      foundReports,
      resolvedReports,
      claimGroups,
      rewardGroups,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ isSuspended: true }),

      Item.countDocuments(),
      Item.countDocuments({
        status: 'active',
        isHidden: { $ne: true },
      }),
      Item.countDocuments({ isHidden: true }),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'resolved' }),

      Claim.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      Reward.aggregate([
        {
          $group: {
            _id: null,
            pointsIssued: { $sum: '$points' },
            rewardEvents: { $sum: 1 },
          },
        },
      ]),
    ]);
  } catch (error) {
    return next(error);
  }
}

export async function getAdminUsers(req, res, next) {
  try {
    const { search = '' } = req.query;
    const filter = {};

    if (typeof search === 'string' && search.trim()) {
      const pattern = new RegExp(escapeRegex(search.trim()), 'i');

      filter.$or = [
        { name: pattern },
        { email: pattern },
        { username: pattern },
      ];
    }

    const users = await User.find(filter)
      .select(
        'name email username role isEmailVerified isSuspended suspensionReason createdAt',
      )
      .sort({ createdAt: -1 })
      .limit(getLimit(req.query.limit))
      .lean();

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminReports(req, res, next) {
  try {
    const {
      search = '',
      type,
      status,
      hidden,
    } = req.query;

    const filter = {};

    if (['lost', 'found'].includes(type)) {
      filter.type = type;
    }

    if (['active', 'claimed', 'resolved'].includes(status)) {
      filter.status = status;
    }

    if (hidden === 'true') {
      filter.isHidden = true;
    } else if (hidden === 'false') {
      filter.isHidden = { $ne: true };
    }

    if (typeof search === 'string' && search.trim()) {
      const pattern = new RegExp(escapeRegex(search.trim()), 'i');

      filter.$or = [
        { title: pattern },
        { description: pattern },
        { location: pattern },
      ];
    }

    const reports = await Item.find(filter)
      .populate('reportedBy', 'name username email')
      .populate('moderatedBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(getLimit(req.query.limit))
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

export async function setReportVisibility(req, res, next) {
  try {
    const { id } = req.params;
    const { hidden, reason = '' } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID.',
      });
    }

    if (typeof hidden !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'hidden must be true or false.',
      });
    }

    if (
      hidden &&
      (typeof reason !== 'string' ||
        reason.trim().length < 4 ||
        reason.trim().length > 300)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Provide a moderation reason between 4 and 300 characters.',
      });
    }

    const report = await Item.findByIdAndUpdate(
      id,
      {
        $set: {
          isHidden: hidden,
          moderationReason: hidden ? reason.trim() : '',
          moderatedBy: req.user._id,
          moderatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate('reportedBy', 'name username email')
      .populate('moderatedBy', 'name username');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    return res.json({
      success: true,
      report,
      message: hidden
        ? 'Report hidden from public browsing.'
        : 'Report restored to public visibility.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function setUserSuspension(req, res, next) {
  try {
    const { id } = req.params;
    const { suspended, reason = '' } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.',
      });
    }

    if (typeof suspended !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'suspended must be true or false.',
      });
    }

    if (
      suspended &&
      (typeof reason !== 'string' ||
        reason.trim().length < 4 ||
        reason.trim().length > 300)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Provide a suspension reason between 4 and 300 characters.',
      });
    }

    if (String(req.user._id) === id) {
      return res.status(409).json({
        success: false,
        message: 'You cannot suspend your own account.',
      });
    }

    const target = await User.findById(id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (target.role === 'admin') {
      return res.status(409).json({
        success: false,
        message: 'This action cannot suspend an administrator.',
      });
    }

    target.isSuspended = suspended;
    target.suspendedAt = suspended ? new Date() : null;
    target.suspendedBy = suspended ? req.user._id : null;
    target.suspensionReason = suspended ? reason.trim() : '';

    await target.save();

    return res.json({
      success: true,
      user: {
        id: target._id,
        name: target.name,
        email: target.email,
        role: target.role || 'user',
        isSuspended: target.isSuspended,
        suspensionReason: target.suspensionReason,
      },
      message: suspended
        ? 'User account suspended.'
        : 'User account restored.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminClaims(req, res, next) {
  try {
    const claims = await Claim.find()
      .populate('claimant', 'name username email')
      .populate('lostItem', 'title type status isHidden')
      .populate({
        path: 'foundItem',
        select: 'title type status isHidden reportedBy',
        populate: {
          path: 'reportedBy',
          select: 'name username email',
        },
      })
      .sort({ createdAt: -1 })
      .limit(getLimit(req.query.limit))
      .lean();

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    return next(error);
  }
}
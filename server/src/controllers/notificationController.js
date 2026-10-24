
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user._id;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .populate('actor', 'name username avatarUrl')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),

      Notification.countDocuments({
        recipient: userId,
        readAt: null,
      }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID.',
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: req.user._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } },
      { new: true },
    ).lean();

    if (!notification) {
      const exists = await Notification.exists({
        _id: id,
        recipient: req.user._id,
      });

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found.',
        });
      }

      return res.json({
        success: true,
        message: 'Notification was already read.',
      });
    }

    return res.json({
      success: true,
      notification,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } },
    );

    return res.json({
      success: true,
      updatedCount: result.modifiedCount,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    return next(error);
  }
}

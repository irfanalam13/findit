import Reward from '../models/Reward.js';

export async function getMyRewards(req, res, next) {
  try {
    const userId = req.user._id;

    const [summary, rewards] = await Promise.all([
      Reward.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: '$points' },
            rewardCount: { $sum: 1 },
          },
        },
      ]),

      Reward.find({ user: userId })
        .select('item points reason createdAt')
        .populate('item', 'title type category location imageUrl')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

    const totals = summary[0] || {
      totalPoints: 0,
      rewardCount: 0,
    };

    return res.json({
      success: true,
      summary: {
        totalPoints: totals.totalPoints,
        rewardCount: totals.rewardCount,
      },
      rewards,
    });
  } catch (error) {
    return next(error);
  }
}
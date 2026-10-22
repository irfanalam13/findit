
import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    eventKey: {
      type: String,
      required: true,
      unique: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      enum: ['confirmed_return'],
      required: true,
    },
  },
  { timestamps: true },
);

rewardSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Reward', rewardSchema);

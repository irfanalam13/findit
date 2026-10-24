
import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'completed',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// A user can only submit one claim for the same report pair.
claimSchema.index(
  { lostItem: 1, foundItem: 1, claimant: 1 },
  { unique: true },
);

// A lost report can have at most one accepted claim.
claimSchema.index(
  { lostItem: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'accepted' },
  },
);

// A found report can have at most one accepted claim.
claimSchema.index(
  { foundItem: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'accepted' },
  },
);

export default mongoose.model('Claim', claimSchema);

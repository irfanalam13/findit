
import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'electronics',
        'wallet',
        'keys',
        'documents',
        'clothing',
        'bags',
        'accessories',
        'other',
      ],
      required: true,
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    dateOccurred: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'claimed', 'resolved'],
      default: 'active',
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

itemSchema.index({
  type: 1,
  status: 1,
  category: 1,
  dateOccurred: -1,
})

export default mongoose.model('Item', itemSchema)

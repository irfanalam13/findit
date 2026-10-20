
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOtpHash: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },
    emailVerificationOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    emailVerificationOtpSentAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)

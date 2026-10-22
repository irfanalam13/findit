
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
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
  username: {
    type: String,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 24,
    match: /^[a-z0-9_]+$/,
    sparse: true,
    unique: true,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 300,
    default: '',
  },
  city: {
    type: String,
    trim: true,
    maxlength: 100,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  avatarStorageKey: {
    type: String,
    default: '',
    select: false,
  },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)

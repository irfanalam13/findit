
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  register,
  verifyEmail,
  resendVerificationOtp,
  login,
  logout,
  getCurrentUser,
} from '../controllers/authController.js';

import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts. Try again later.',
  },
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Try again later.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Try again later.',
  },
});

router.post('/register', registerLimiter, register);

router.post('/verify-email', verificationLimiter, verifyEmail);

router.post(
  '/resend-verification',
  verificationLimiter,
  resendVerificationOtp,
);

router.post('/login', loginLimiter, login);

router.post('/logout', requireAuth, logout);

router.get('/me', requireAuth, getCurrentUser);

export default router;

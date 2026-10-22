import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { sendVerificationOtp } from '../services/emailService.js'

const OTP_TTL_MS = 10 * 60 * 1000
const OTP_RESEND_COOLDOWN_MS = 60 * 1000
const MAX_OTP_ATTEMPTS = 5
const MIN_PASSWORD_LENGTH = 8

function normalizeEmail(email) {
  return typeof email === 'string'
    ? email.trim().toLowerCase()
    : ''
}

function hashOtp(email, otp) {
  const pepper = process.env.OTP_PEPPER

  if (!pepper) {
    throw new Error('OTP_PEPPER is not configured')
  }

  return crypto
    .createHmac('sha256', pepper)
    .update(`${email}:${otp}`)
    .digest('hex')
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString()
}

function safeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username || '',
    avatarUrl: user.avatarUrl || '',
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

function clearOtp(user) {
  user.emailVerificationOtpHash = null
  user.emailVerificationOtpExpires = null
  user.emailVerificationOtpAttempts = 0
  user.emailVerificationOtpSentAt = null
}

async function issueVerificationOtp(user) {
  const otp = generateOtp()

  user.emailVerificationOtpHash = hashOtp(user.email, otp)
  user.emailVerificationOtpExpires = new Date(
    Date.now() + OTP_TTL_MS
  )
  user.emailVerificationOtpAttempts = 0
  user.emailVerificationOtpSentAt = new Date()

  await user.save()

  try {
    await sendVerificationOtp(user.email, otp)
  } catch {
    clearOtp(user)
    await user.save()

    throw new Error('VERIFICATION_EMAIL_FAILED')
  }
}


export async function register(req, res, next) {
    console.log('REGISTER DEBUG:', {
        bodyKeys: Object.keys(req.body ?? {}),
        receivedName: req.body?.name,
        receivedEmail: req.body?.email,
        nameType: typeof req.body?.name,
    });
  try {
    const name =
      typeof req.body?.name === 'string'
        ? req.body.name.trim()
        : '';

    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    // Validate full name.
    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 80 characters.',
      });
    }

    // Validate email.
    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.',
      });
    }

    // Validate password.
    if (
      typeof password !== 'string' ||
      password.length < MIN_PASSWORD_LENGTH ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least 8 characters and no more than 72 UTF-8 bytes.',
      });
    }

    let user = await User.findOne({ email }).select(
      '+passwordHash ' +
        '+emailVerificationOtpHash ' +
        '+emailVerificationOtpExpires ' +
        '+emailVerificationOtpAttempts ' +
        '+emailVerificationOtpSentAt',
    );

    // Prevent duplicate verified accounts.
    if (user?.isEmailVerified) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Enforce OTP resend cooldown.
    if (user?.emailVerificationOtpSentAt) {
      const elapsed =
        Date.now() - user.emailVerificationOtpSentAt.getTime();

      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        return res.status(429).json({
          success: false,
          message:
            'Please wait before requesting another verification code.',
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (!user) {
      user = new User({
        name,
        email,
        passwordHash,
        isEmailVerified: false,
      });
    } else {
      // Update the existing unverified account.
      user.name = name;
      user.passwordHash = passwordHash;
    }

    // Persist the user before sending the OTP.
    await user.save();

    try {
      await issueVerificationOtp(user);
    } catch (error) {
      if (error.message === 'VERIFICATION_EMAIL_FAILED') {
        return res.status(503).json({
          success: false,
          message:
            'Unable to send the verification email. Please try again later.',
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message:
        'Account created. Check your email for the verification code.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    return next(error);
  }
}


export async function verifyEmail(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email)
    const otp = req.body?.otp

    if (
      !email ||
      typeof otp !== 'string' ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Provide a valid email and six-digit code.',
      })
    }

    const user = await User.findOne({ email }).select(
      '+emailVerificationOtpHash ' +
      '+emailVerificationOtpExpires ' +
      '+emailVerificationOtpAttempts'
    )

    if (!user || user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'The verification code is invalid or expired.',
      })
    }

    if (
      !user.emailVerificationOtpHash ||
      !user.emailVerificationOtpExpires
    ) {
      return res.status(400).json({
        success: false,
        message: 'The verification code is invalid or expired.',
      })
    }

    if (user.emailVerificationOtpExpires.getTime() <= Date.now()) {
      clearOtp(user)
      await user.save()

      return res.status(400).json({
        success: false,
        message: 'The verification code is invalid or expired.',
      })
    }

    if (
      user.emailVerificationOtpAttempts >= MAX_OTP_ATTEMPTS
    ) {
      clearOtp(user)
      await user.save()

      return res.status(429).json({
        success: false,
        message:
          'Too many verification attempts. Request a new code.',
      })
    }

    user.emailVerificationOtpAttempts += 1

    const suppliedHash = Buffer.from(
      hashOtp(email, otp),
      'hex'
    )
    const storedHash = Buffer.from(
      user.emailVerificationOtpHash,
      'hex'
    )

    const matches =
      suppliedHash.length === storedHash.length &&
      crypto.timingSafeEqual(suppliedHash, storedHash)

    if (!matches) {
      if (
        user.emailVerificationOtpAttempts >= MAX_OTP_ATTEMPTS
      ) {
        clearOtp(user)
      }

      await user.save()

      return res.status(400).json({
        success: false,
        message: 'The verification code is invalid or expired.',
      })
    }

    user.isEmailVerified = true
    clearOtp(user)

    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    })
  } catch (error) {
    next(error)
  }
}

export async function resendVerificationOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email)

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Enter your registered email address.',
      })
    }

    const user = await User.findOne({ email }).select(
      '+emailVerificationOtpHash ' +
      '+emailVerificationOtpExpires ' +
      '+emailVerificationOtpAttempts ' +
      '+emailVerificationOtpSentAt'
    )

    const genericResponse = {
      success: true,
      message:
        'If the account can receive a verification code, an email will be sent.',
    }

    if (!user || user.isEmailVerified) {
      return res.status(200).json(genericResponse)
    }

    if (user.emailVerificationOtpSentAt) {
      const elapsed =
        Date.now() -
        user.emailVerificationOtpSentAt.getTime()

      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        return res.status(429).json({
          success: false,
          message:
            'Please wait before requesting another verification code.',
        })
      }
    }

    try {
      await issueVerificationOtp(user)
    } catch (error) {
      if (error.message === 'VERIFICATION_EMAIL_FAILED') {
        return res.status(503).json({
          success: false,
          message:
            'Unable to send the verification email. Please try again later.',
        })
      }

      throw error
    }

    return res.status(200).json(genericResponse)
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email)
    const password = req.body?.password

    if (!email || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const user = await User.findOne({ email }).select(
      '+passwordHash'
    )

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Verify your email before logging in.',
      })
    }

    req.session.regenerate((error) => {
      if (error) {
        return next(error)
      }

      req.session.userId = user._id.toString()

      req.session.save((saveError) => {
        if (saveError) {
          return next(saveError)
        }

        return res.status(200).json({
          success: true,
          message: 'Login successful.',
          user: safeUser(user),
        })
      })
    })
  } catch (error) {
    next(error)
  }
}

export const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('findit.sid', {
      httpOnly: true,
      secure: isProduction,
      sameSite: process.env.SESSION_COOKIE_SAME_SITE || 'lax',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  });
};


export async function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: safeUser(req.user),
  })
}
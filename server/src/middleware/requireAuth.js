import User from '../models/User.js'

export async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to continue.',
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Your session is no longer valid.',
      })
    }

    if (!user.isEmailVerified) {
      req.session.destroy(() => {})

      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Verify your email before continuing.',
      })
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message:
          'This account has been suspended. Contact Findit support.',
      });
    }

    req.user = user

    return next()
  } catch (error) {
    return next(error)
  }
}
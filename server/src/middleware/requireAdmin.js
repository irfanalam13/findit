export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to continue.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrator access is required.',
    });
  }

  return next();
}
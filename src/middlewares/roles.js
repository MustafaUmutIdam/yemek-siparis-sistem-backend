/**
 * Role-based access middleware
 * Usage: requireRole('admin'), requireRole('owner') etc.
 */

const requireRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const role = req.user.role;
      if (role !== requiredRole) {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireRole,
};
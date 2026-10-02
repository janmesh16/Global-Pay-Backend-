const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware.
 * Usage: authorize('admin') or authorize('admin', 'user')
 * Must be used AFTER the auth middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
      );
    }
    next();
  };
};

module.exports = authorize;

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verify JWT token and attach user to req.user.
 * Rejects if token is missing, invalid, or user is suspended/blocked.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. Please provide a valid token.');
  }

  // Verify token
  const decoded = jwt.verify(token, env.JWT_SECRET);

  // Load user
  const user = await User.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('User associated with this token no longer exists.');
  }

  // Check if user is active
  if (user.status === 'suspended') {
    throw ApiError.forbidden('Your account has been suspended. Contact support.');
  }
  if (user.status === 'blocked') {
    throw ApiError.forbidden('Your account has been blocked. Contact support.');
  }

  req.user = user;
  next();
});

/**
 * Role-based authorization middleware.
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden(`Access denied. Requires role: ${roles.join(', ')}`);
  }
  next();
};

authenticate.authenticate = authenticate;
authenticate.requireRole = requireRole;

module.exports = authenticate;

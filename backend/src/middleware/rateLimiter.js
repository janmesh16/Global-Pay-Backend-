const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const skipInTest = (req, res, next) => next();

const generalLimiter = env.NODE_ENV === 'test' ? skipInTest : rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

const authLimiter = env.NODE_ENV === 'test' ? skipInTest : rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
});

const transferLimiter = env.NODE_ENV === 'test' ? skipInTest : rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many transfer requests, please try again later',
  },
});

module.exports = { generalLimiter, authLimiter, transferLimiter };

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * 404 handler for unknown routes.
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

/**
 * Global error handler.
 * Maps known error types to consistent JSON envelope responses.
 */
const globalErrorHandler = (err, req, res, _next) => {
  let error = err;

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.validation(errors);
  }

  // Mongoose duplicate key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    error = ApiError.conflict(`Duplicate value for ${field}`);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const errors = error.errors || [];

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, { stack: err.stack, url: req.originalUrl });
  } else if (statusCode >= 400) {
    logger.warn(`[${statusCode}] ${message}`, { url: req.originalUrl });
  }

  const response = { success: false, message };
  if (errors.length > 0) {
    response.errors = errors;
  }
  // Never expose stack in production
  if (env.isDev && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, globalErrorHandler };

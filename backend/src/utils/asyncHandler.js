/**
 * Wraps an async route handler to catch errors and forward them to Express error middleware.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 *
 * @param {Function} fn - Async Express handler (req, res, next)
 * @returns {Function} Wrapped handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

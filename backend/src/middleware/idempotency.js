const Transaction = require('../models/Transaction');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Idempotency middleware for POST /api/transfers.
 * If the request has an Idempotency-Key header and a transaction already
 * exists with that key for the same user, return the existing transaction.
 */
const idempotency = asyncHandler(async (req, res, next) => {
  const key = req.headers['idempotency-key'];
  if (!key) return next();

  const existing = await Transaction.findOne({
    idempotencyKey: key,
    sender: req.user._id,
  }).populate('recipient', 'fullName country currency');

  if (existing) {
    return sendSuccess(res, 'Transfer already processed (idempotent)', existing, 200);
  }

  // Attach key for downstream use
  req.idempotencyKey = key;
  next();
});

module.exports = idempotency;

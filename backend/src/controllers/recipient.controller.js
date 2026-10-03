const Recipient = require('../models/Recipient');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../utils/response');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

/**
 * POST /api/recipients
 */
const createRecipient = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    fullName: req.body.fullName || req.body.name,
    bankName: req.body.bankName || 'Bank Account',
    ifscOrSwift: req.body.ifscOrSwift || req.body.routingNumber || 'HDFC0001234',
    user: req.user._id,
  };
  const recipient = await Recipient.create(payload);
  sendCreated(res, 'Recipient created', recipient);
});

/**
 * GET /api/recipients
 */
const listRecipients = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = { user: req.user._id, isActive: true };

  if (req.query.country) filter.country = req.query.country;
  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { bankName: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [recipients, total] = await Promise.all([
    Recipient.find(filter).sort(sort).skip(skip).limit(limit),
    Recipient.countDocuments(filter),
  ]);

  sendSuccess(res, 'Recipients list', paginatedResponse(recipients, total, page, limit));
});

/**
 * GET /api/recipients/:id
 */
const getRecipient = asyncHandler(async (req, res) => {
  const recipient = await Recipient.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!recipient) throw ApiError.notFound('Recipient not found');
  sendSuccess(res, 'Recipient details', recipient);
});

/**
 * PUT /api/recipients/:id
 */
const updateRecipient = asyncHandler(async (req, res) => {
  const recipient = await Recipient.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!recipient) throw ApiError.notFound('Recipient not found');
  sendSuccess(res, 'Recipient updated', recipient);
});

/**
 * DELETE /api/recipients/:id (soft delete)
 */
const deleteRecipient = asyncHandler(async (req, res) => {
  const recipient = await Recipient.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!recipient) throw ApiError.notFound('Recipient not found');

  // Check for pending transfers
  const pendingTransfers = await Transaction.countDocuments({
    recipient: recipient._id,
    status: 'pending',
  });
  if (pendingTransfers > 0) {
    throw ApiError.badRequest('Cannot delete recipient with pending transfers');
  }

  recipient.isActive = false;
  await recipient.save();
  sendSuccess(res, 'Recipient deleted');
});

module.exports = { createRecipient, listRecipients, getRecipient, updateRecipient, deleteRecipient };

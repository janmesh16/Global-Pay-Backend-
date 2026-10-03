const transferService = require('../services/transfer.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

/**
 * Initiate a new transfer.
 * POST /api/transfers
 */
const createTransfer = asyncHandler(async (req, res) => {
  const idempotencyKey = req.idempotencyKey || req.headers['idempotency-key'] || req.body?.idempotencyKey;
  const transfer = await transferService.createTransfer(req.user._id, {
    ...req.body,
    idempotencyKey: idempotencyKey || undefined,
  });
  sendSuccess(res, 'Transfer initiated successfully', transfer, 201);
});

/**
 * Get user transfer history.
 * GET /api/transfers
 */
const getTransfers = asyncHandler(async (req, res) => {
  const { transfers, pagination } = await transferService.getTransfers(req.user._id, req.query);
  sendSuccess(res, 'Transfers retrieved successfully', { transfers, pagination });
});

/**
 * Get single transfer details.
 * GET /api/transfers/:id
 */
const getTransferById = asyncHandler(async (req, res) => {
  const transfer = await transferService.getTransferById(req.user._id, req.params.id);
  sendSuccess(res, 'Transfer details retrieved successfully', transfer);
});

/**
 * Get transfer status tracking info.
 * GET /api/transfers/status/:id
 */
const getTransferStatus = asyncHandler(async (req, res) => {
  const transfer = await transferService.getTransferById(req.user._id, req.params.id);
  sendSuccess(res, 'Transfer status retrieved successfully', {
    id: transfer._id,
    reference: transfer.reference,
    status: transfer.status,
    complianceStatus: transfer.complianceStatus,
    amount: transfer.amount,
    sourceCurrency: transfer.sourceCurrency,
    targetCurrency: transfer.targetCurrency,
    createdAt: transfer.createdAt,
    updatedAt: transfer.updatedAt,
  });
});

/**
 * Cancel a pending transfer.
 * POST /api/transfers/:id/cancel
 */
const cancelTransfer = asyncHandler(async (req, res) => {
  const transfer = await transferService.cancelTransfer(req.user._id, req.params.id);
  sendSuccess(res, 'Transfer cancelled successfully', transfer);
});

module.exports = {
  createTransfer,
  getTransfers,
  getTransferById,
  getTransferStatus,
  cancelTransfer,
};

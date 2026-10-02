const walletService = require('../services/wallet.service');
const paymentService = require('../services/payment.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { LEDGER_TYPES } = require('../utils/constants');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const WalletLedger = require('../models/WalletLedger');

/**
 * GET /api/wallet
 */
const getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user._id);
  const recentLedger = await WalletLedger.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);
  sendSuccess(res, 'Wallet details', { wallet: wallet.toJSON(), recentLedger });
});

/**
 * POST /api/wallet/add-funds
 */
const addFunds = asyncHandler(async (req, res) => {
  const { amount, method } = req.body;

  // Process payment (simulated)
  const payment = await paymentService.processTopUp({
    amount,
    currency: 'USD',
    method: method || 'bank_transfer',
    userId: req.user._id.toString(),
  });

  // Credit wallet
  const wallet = await walletService.creditWallet({
    userId: req.user._id,
    amount,
    type: LEDGER_TYPES.CREDIT_TOPUP,
    description: `Top-up via ${method || 'bank_transfer'} (Ref: ${payment.reference})`,
  });

  sendSuccess(res, 'Funds added successfully', {
    wallet: wallet.toJSON(),
    payment: { reference: payment.reference },
  });
});

/**
 * GET /api/wallet/balance
 */
const getBalance = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user._id);
  sendSuccess(res, 'Wallet balance', {
    balance: wallet.toJSON().balance,
    currency: wallet.currency,
  });
});

/**
 * GET /api/wallet/ledger
 */
const getLedger = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const { entries, total } = await walletService.getLedger(req.user._id, { skip, limit, sort });
  sendSuccess(res, 'Wallet ledger', paginatedResponse(entries, total, page, limit));
});

module.exports = { getWallet, addFunds, getBalance, getLedger };

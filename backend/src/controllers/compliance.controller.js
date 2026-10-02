const ComplianceLog = require('../models/ComplianceLog');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { COMPLIANCE_STATUS } = require('../utils/constants');

/**
 * Get compliance audit logs with pagination and filters.
 * GET /api/compliance/logs
 */
const getComplianceLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, result, checkType, userId, transactionId } = req.query;
  const query = {};

  if (result) query.result = result;
  if (checkType) query.checkType = checkType;
  if (userId) query.user = userId;
  if (transactionId) query.transaction = transactionId;

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ComplianceLog.find(query)
      .populate('user', 'fullName email kycStatus')
      .populate('transaction', 'reference amount sourceCurrency status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ComplianceLog.countDocuments(query),
  ]);

  sendPaginated(res, logs, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }, 'Compliance logs retrieved');
});

/**
 * Get all flagged transactions awaiting compliance review.
 * GET /api/compliance/flagged
 */
const getFlaggedTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [transfers, total] = await Promise.all([
    Transaction.find({ complianceStatus: COMPLIANCE_STATUS.FLAGGED })
      .populate('sender', 'fullName email kycStatus')
      .populate('recipient', 'fullName country accountDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Transaction.countDocuments({ complianceStatus: COMPLIANCE_STATUS.FLAGGED }),
  ]);

  sendPaginated(res, transfers, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }, 'Flagged transactions retrieved');
});

/**
 * Perform real-time KYC/AML compliance verification.
 * POST /api/compliance/verify
 */
const verifyCompliance = asyncHandler(async (req, res) => {
  const complianceService = require('../services/compliance.service');
  const User = require('../models/User');
  const mongoose = require('mongoose');

  const { userId, amount, recipientCountry } = req.body;
  const user = await User.findById(userId || req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const mockTransfer = {
    _id: new mongoose.Types.ObjectId(),
    amount: amount || 100,
    recipientCountry: recipientCountry || 'US',
  };

  const result = await complianceService.runChecks(user, mockTransfer);
  sendSuccess(res, 'Compliance verification complete', result);
});

module.exports = {
  getComplianceLogs,
  getFlaggedTransactions,
  verifyCompliance,
};

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Settings = require('../models/Settings');
const ComplianceLog = require('../models/ComplianceLog');
const walletService = require('./wallet.service');
const socketService = require('./socket.service');
const notificationService = require('./notification.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { fromDecimal128 } = require('../utils/money');
const {
  TRANSACTION_STATUS,
  COMPLIANCE_STATUS,
  LEDGER_TYPES,
  KYC_STATUS,
} = require('../utils/constants');

/**
 * Get aggregated system metrics for admin dashboard.
 */
const getMetrics = async () => {
  const [
    totalUsers,
    verifiedUsers,
    totalTransactions,
    flaggedTransfers,
    completedTransfers,
    volumeAgg,
    feeAgg,
    settings,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', kycStatus: KYC_STATUS.VERIFIED }),
    Transaction.countDocuments(),
    Transaction.countDocuments({ complianceStatus: COMPLIANCE_STATUS.FLAGGED }),
    Transaction.countDocuments({ status: TRANSACTION_STATUS.COMPLETED }),
    Transaction.aggregate([
      { $match: { status: TRANSACTION_STATUS.COMPLETED } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
    ]),
    Transaction.aggregate([
      { $match: { status: TRANSACTION_STATUS.COMPLETED } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$fee' } } } },
    ]),
    Settings.getGlobal(),
  ]);

  return {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
    },
    transfers: {
      total: totalTransactions,
      completed: completedTransfers,
      flagged: flaggedTransfers,
      totalVolume: volumeAgg[0]?.total || 0,
      totalFeesCollected: feeAgg[0]?.total || 0,
    },
    settings,
  };
};

/**
 * List all transfers with admin filters.
 */
const getAdminTransfers = async (filters = {}) => {
  const { page = 1, limit = 20, status, complianceStatus, userId, reference } = filters;
  const query = {};

  if (status) query.status = status;
  if (complianceStatus) query.complianceStatus = complianceStatus;
  if (userId) query.sender = userId;
  if (reference) query.reference = new RegExp(reference, 'i');

  const skip = (page - 1) * limit;

  const [transfers, total] = await Promise.all([
    Transaction.find(query)
      .populate('sender', 'fullName email kycStatus')
      .populate('recipient', 'fullName country accountDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Transaction.countDocuments(query),
  ]);

  return {
    transfers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Review flagged compliance transfer (Approve or Reject).
 */
const reviewTransferCompliance = async (transferId, { action, note = '', adminId }) => {
  const transfer = await Transaction.findById(transferId).populate('sender');
  if (!transfer) throw ApiError.notFound('Transfer not found');

  if (transfer.complianceStatus !== COMPLIANCE_STATUS.FLAGGED && transfer.status !== TRANSACTION_STATUS.PENDING) {
    throw ApiError.badRequest('Transfer is not pending compliance review');
  }

  const senderId = transfer.sender._id || transfer.sender;
  const totalDebited = fromDecimal128(transfer.totalDebited);

  if (action === 'approve') {
    transfer.complianceStatus = COMPLIANCE_STATUS.CLEARED;
    transfer.status = TRANSACTION_STATUS.COMPLETED;
    transfer.completedAt = new Date();
    transfer.statusHistory.push({
      status: TRANSACTION_STATUS.COMPLETED,
      at: new Date(),
      note: `Approved by admin (${adminId}): ${note}`,
    });

    logger.info(`[admin] Transfer ${transfer.reference} approved by admin ${adminId}`);
  } else if (action === 'reject') {
    transfer.complianceStatus = COMPLIANCE_STATUS.REJECTED;
    transfer.status = TRANSACTION_STATUS.FAILED;
    transfer.failureReason = note || 'Rejected by compliance officer';
    transfer.statusHistory.push({
      status: TRANSACTION_STATUS.FAILED,
      at: new Date(),
      note: `Rejected by admin (${adminId}): ${note}`,
    });

    // Refund wallet
    await walletService.creditWallet({
      userId: senderId,
      amount: totalDebited,
      type: LEDGER_TYPES.CREDIT_REFUND,
      description: `Refund for compliance-rejected transfer ${transfer.reference}`,
      reference: transfer.reference,
    });

    logger.info(`[admin] Transfer ${transfer.reference} rejected by admin ${adminId} & refunded.`);
  } else {
    throw ApiError.badRequest('Action must be "approve" or "reject"');
  }

  await transfer.save();

  // Socket & FCM update
  socketService.sendToUser(senderId, 'transfer_updated', transfer);
  notificationService.sendToUser(
    senderId,
    {
      title: `Transfer Review Complete`,
      body: `Your transfer ${transfer.reference} was ${transfer.status === TRANSACTION_STATUS.COMPLETED ? 'approved' : 'rejected'}.`,
    },
    { transactionId: transfer._id.toString() }
  );

  return transfer;
};

/**
 * List all users for admin management.
 */
const getAdminUsers = async (filters = {}) => {
  const { page = 1, limit = 20, search, kycStatus, status } = filters;
  const query = {};

  if (kycStatus) query.kycStatus = kycStatus;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { fullName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update user KYC status.
 */
const updateUserKyc = async (userId, { kycStatus }) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.kycStatus = kycStatus;
  await user.save();

  logger.info(`[admin] Updated KYC for user ${userId} to ${kycStatus}`);
  return user;
};

/**
 * Update user account status (active, suspended, blocked).
 */
const updateUserStatus = async (userId, { status }) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.status = status;
  await user.save();

  logger.info(`[admin] Updated account status for user ${userId} to ${status}`);
  return user;
};

/**
 * Update global system settings.
 */
const updateSettings = async (updates) => {
  const settings = await Settings.getGlobal();

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      settings[key] = updates[key];
    }
  });

  await settings.save();
  logger.info(`[admin] Updated system global settings.`);
  return settings;
};

module.exports = {
  getMetrics,
  getAdminTransfers,
  reviewTransferCompliance,
  getAdminUsers,
  updateUserKyc,
  updateUserStatus,
  updateSettings,
};

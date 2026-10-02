const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Recipient = require('../models/Recipient');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Settings = require('../models/Settings');
const walletService = require('./wallet.service');
const currencyService = require('./currency.service');
const feeService = require('./fee.service');
const complianceService = require('./compliance.service');
const socketService = require('./socket.service');
const notificationService = require('./notification.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { toDecimal128, fromDecimal128 } = require('../utils/money');
const {
  TRANSACTION_STATUS,
  COMPLIANCE_STATUS,
  LEDGER_TYPES,
  WALLET_STATUS,
} = require('../utils/constants');

const getSessionIfReplicaSet = async () => {
  try {
    const topologyType = mongoose.connection.client?.topology?.description?.type;
    if (topologyType && topologyType !== 'Single') {
      const session = await mongoose.startSession();
      session.startTransaction();
      return session;
    }
  } catch (err) {
    // Fallback to null for standalone
  }
  return null;
};

/**
 * Create a new transfer.
 */
const createTransfer = async (senderId, data) => {
  const { recipientId, amount, sourceCurrency, targetCurrency, idempotencyKey } = data;

  // 1. Idempotency Check
  if (idempotencyKey) {
    const existing = await Transaction.findOne({ idempotencyKey });
    if (existing) {
      logger.info(`[transfer] Returning idempotent transaction ${existing.reference}`);
      return existing;
    }
  }

  // 2. Fetch User & Validate Wallet
  const user = await User.findById(senderId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.status !== 'active') {
    throw ApiError.forbidden('User account is not active');
  }

  const wallet = await walletService.getWallet(senderId);
  if (wallet.status === WALLET_STATUS.FROZEN) {
    throw ApiError.forbidden('Wallet is frozen. Cannot send money.');
  }

  // 3. Validate Recipient
  const recipient = await Recipient.findOne({ _id: recipientId, user: senderId, isActive: true });
  if (!recipient) {
    throw ApiError.notFound('Recipient not found or inactive');
  }

  // 4. Calculate Exchange Rate & Fees
  const { rate } = await currencyService.getRate(sourceCurrency, targetCurrency);
  const { fee, totalDebited } = await feeService.calculateFee(amount);
  const convertedAmount = Math.round(amount * rate * 100) / 100;

  // Check wallet balance
  const currentBalance = fromDecimal128(wallet.balance);
  if (currentBalance < totalDebited) {
    throw ApiError.badRequest(`Insufficient balance. Total required: ${totalDebited} ${wallet.currency}`);
  }

  // Check Global Daily Limit
  const settings = await Settings.getGlobal();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyAgg = await Transaction.aggregate([
    {
      $match: {
        sender: new mongoose.Types.ObjectId(senderId),
        createdAt: { $gte: startOfDay },
        status: { $ne: TRANSACTION_STATUS.FAILED },
      },
    },
    { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
  ]);
  const currentDailySpent = dailyAgg[0]?.total || 0;

  if (currentDailySpent + amount > settings.dailyLimit) {
    throw ApiError.badRequest(
      `Transfer exceeds daily limit of ${settings.dailyLimit} ${wallet.currency}. Current spent today: ${currentDailySpent.toFixed(2)}`
    );
  }

  // 5. Debit Wallet
  const session = await getSessionIfReplicaSet();
  let transaction;

  try {
    const opts = session ? { session } : {};

    const [tx] = await Transaction.create(
      [
        {
          sender: senderId,
          recipient: recipientId,
          senderWallet: wallet._id,
          amount: toDecimal128(amount),
          sourceCurrency,
          targetCurrency,
          exchangeRate: toDecimal128(rate),
          convertedAmount: toDecimal128(convertedAmount),
          fee: toDecimal128(fee),
          totalDebited: toDecimal128(totalDebited),
          status: TRANSACTION_STATUS.PENDING,
          idempotencyKey: idempotencyKey || null,
          statusHistory: [
            {
              status: TRANSACTION_STATUS.PENDING,
              at: new Date(),
              note: 'Transfer initiated',
            },
          ],
        },
      ],
      opts
    );

    transaction = tx;

    // Debit sender wallet
    await walletService.debitWallet({
      userId: senderId,
      amount: totalDebited,
      type: LEDGER_TYPES.DEBIT_TRANSFER,
      description: `Transfer to ${recipient.fullName} (${transaction.reference})`,
      reference: transaction.reference,
      session,
    });

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }

  // 6. Run Compliance Checks (post-debit)
  const complianceResult = await complianceService.runChecks(
    user,
    {
      _id: transaction._id,
      amount: transaction.amount,
      recipientCountry: recipient.country,
    },
    settings
  );

  transaction.complianceStatus = complianceResult.complianceStatus;
  transaction.riskScore = complianceResult.riskScore;

  if (complianceResult.complianceStatus === COMPLIANCE_STATUS.REJECTED) {
    transaction.status = TRANSACTION_STATUS.FAILED;
    transaction.failureReason = complianceResult.logs.map((l) => l.reasons.join(', ')).join('; ');
    transaction.statusHistory.push({
      status: TRANSACTION_STATUS.FAILED,
      at: new Date(),
      note: `Rejected by compliance: ${transaction.failureReason}`,
    });

    await walletService.creditWallet({
      userId: senderId,
      amount: totalDebited,
      type: LEDGER_TYPES.CREDIT_REFUND,
      description: `Refund for rejected transfer ${transaction.reference}`,
      reference: transaction.reference,
    });

    logger.warn(`[transfer] ${transaction.reference} rejected by compliance & refunded.`);
  } else if (complianceResult.complianceStatus === COMPLIANCE_STATUS.FLAGGED) {
    transaction.statusHistory.push({
      status: TRANSACTION_STATUS.PENDING,
      at: new Date(),
      note: 'Flagged for compliance manual review',
    });
    logger.info(`[transfer] ${transaction.reference} flagged for compliance review.`);
  } else {
    transaction.status = TRANSACTION_STATUS.COMPLETED;
    transaction.completedAt = new Date();
    transaction.statusHistory.push({
      status: TRANSACTION_STATUS.COMPLETED,
      at: new Date(),
      note: 'Transfer processed and paid out successfully',
    });
    logger.info(`[transfer] ${transaction.reference} completed successfully.`);
  }

  await transaction.save();

  // 7. Realtime Socket & Notification
  socketService.emitTransferStatus(transaction);
  notificationService.sendToUser(
    senderId,
    {
      title: `Transfer ${transaction.status.toUpperCase()}`,
      body: `Your transfer of ${amount} ${sourceCurrency} to ${recipient.fullName} is ${transaction.status}.`,
    },
    { transactionId: transaction._id.toString(), reference: transaction.reference }
  );

  return transaction;
};

const getTransfers = async (userId, filters = {}) => {
  const { page = 1, limit = 20, status, startDate, endDate, recipientId } = filters;
  const query = { sender: userId };

  if (status) query.status = status;
  if (recipientId) query.recipient = recipientId;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [transfers, total] = await Promise.all([
    Transaction.find(query)
      .populate('recipient', 'fullName accountDetails currency country bankName')
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

const getTransferById = async (userId, transferId) => {
  const transfer = await Transaction.findOne({ _id: transferId, sender: userId })
    .populate('recipient', 'fullName email accountDetails currency country bankName')
    .populate('senderWallet', 'accountNumber currency');

  if (!transfer) throw ApiError.notFound('Transfer not found');
  return transfer;
};

const cancelTransfer = async (userId, transferId) => {
  const transfer = await Transaction.findOne({ _id: transferId, sender: userId });
  if (!transfer) throw ApiError.notFound('Transfer not found');

  if (transfer.status !== TRANSACTION_STATUS.PENDING) {
    throw ApiError.badRequest(`Cannot cancel transfer in '${transfer.status}' status`);
  }

  transfer.status = TRANSACTION_STATUS.FAILED;
  transfer.failureReason = 'Cancelled by user';
  transfer.statusHistory.push({
    status: TRANSACTION_STATUS.FAILED,
    at: new Date(),
    note: 'Transfer cancelled by user',
  });

  await transfer.save();

  const totalDebited = fromDecimal128(transfer.totalDebited);
  await walletService.creditWallet({
    userId,
    amount: totalDebited,
    type: LEDGER_TYPES.CREDIT_REFUND,
    description: `Refund for cancelled transfer ${transfer.reference}`,
    reference: transfer.reference,
  });

  socketService.emitTransferStatus(transfer);

  return transfer;
};

module.exports = {
  createTransfer,
  getTransfers,
  getTransferById,
  cancelTransfer,
};

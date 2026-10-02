const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { toDecimal128, fromDecimal128 } = require('../utils/money');
const { WALLET_STATUS, LEDGER_TYPES } = require('../utils/constants');

const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: toDecimal128('0.00'),
      currency: 'USD',
    });
  }
  return wallet;
};

const creditWallet = async ({ userId, amount, type, description, reference = null, session = null }) => {
  const amountStr = parseFloat(amount).toFixed(2);
  const amountDec = parseFloat(amountStr);

  if (amountDec <= 0) throw ApiError.badRequest('Credit amount must be positive');

  const walletQuery = Wallet.findOne({ user: userId });
  if (session) walletQuery.session(session);

  const wallet = await walletQuery;
  if (!wallet) throw ApiError.notFound('Wallet not found');

  if (wallet.status === WALLET_STATUS.FROZEN && type !== LEDGER_TYPES.ADMIN_ADJUSTMENT) {
    throw ApiError.forbidden('Wallet is frozen. Contact support.');
  }

  const balanceBefore = fromDecimal128(wallet.balance);

  const updateOpts = { returnDocument: 'after' };
  if (session) updateOpts.session = session;

  const updated = await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: mongoose.Types.Decimal128.fromString(amountStr) } },
    updateOpts
  );

  const ledgerOpts = session ? { session } : {};
  await WalletLedger.create(
    [{
      user: userId,
      wallet: wallet._id,
      type,
      amount: toDecimal128(amountStr),
      balanceBefore: toDecimal128(balanceBefore),
      balanceAfter: updated.balance,
      reference,
      description,
    }],
    ledgerOpts
  );

  logger.info(`[wallet] Credited ${amountStr} to user ${userId}. New balance: ${fromDecimal128(updated.balance)}`);
  return updated;
};

const debitWallet = async ({ userId, amount, type, description, reference = null, session = null }) => {
  const amountStr = parseFloat(amount).toFixed(2);
  const amountDec = parseFloat(amountStr);

  if (amountDec <= 0) throw ApiError.badRequest('Debit amount must be positive');

  const walletQuery = Wallet.findOne({ user: userId });
  if (session) walletQuery.session(session);

  const wallet = await walletQuery;
  if (!wallet) throw ApiError.notFound('Wallet not found');

  if (wallet.status === WALLET_STATUS.FROZEN) {
    throw ApiError.forbidden('Wallet is frozen. Contact support.');
  }

  const balanceBefore = fromDecimal128(wallet.balance);

  const updateOpts = { returnDocument: 'after' };
  if (session) updateOpts.session = session;

  const updated = await Wallet.findOneAndUpdate(
    {
      user: userId,
      balance: { $gte: mongoose.Types.Decimal128.fromString(amountStr) },
    },
    { $inc: { balance: mongoose.Types.Decimal128.fromString((-amountDec).toFixed(2)) } },
    updateOpts
  );

  if (!updated) {
    throw ApiError.badRequest('Insufficient wallet balance');
  }

  const ledgerOpts = session ? { session } : {};
  await WalletLedger.create(
    [{
      user: userId,
      wallet: wallet._id,
      type,
      amount: toDecimal128(amountStr),
      balanceBefore: toDecimal128(balanceBefore),
      balanceAfter: updated.balance,
      reference,
      description,
    }],
    ledgerOpts
  );

  logger.info(`[wallet] Debited ${amountStr} from user ${userId}. New balance: ${fromDecimal128(updated.balance)}`);
  return updated;
};

const getLedger = async (userId, { skip, limit, sort }) => {
  const [entries, total] = await Promise.all([
    WalletLedger.find({ user: userId }).sort(sort).skip(skip).limit(limit),
    WalletLedger.countDocuments({ user: userId }),
  ]);
  return { entries, total };
};

module.exports = { getWallet, creditWallet, debitWallet, getLedger };

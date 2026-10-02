const mongoose = require('mongoose');
const { LEDGER_TYPES } = require('../utils/constants');
const { fromDecimal128 } = require('../utils/money');

const walletLedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(LEDGER_TYPES),
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    balanceBefore: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    balanceAfter: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    reference: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

walletLedgerSchema.index({ user: 1, createdAt: -1 });
walletLedgerSchema.index({ wallet: 1, createdAt: -1 });

walletLedgerSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    ['amount', 'balanceBefore', 'balanceAfter'].forEach((field) => {
      if (ret[field]) ret[field] = fromDecimal128(ret[field]);
    });
    return ret;
  },
});

module.exports = mongoose.model('WalletLedger', walletLedgerSchema);

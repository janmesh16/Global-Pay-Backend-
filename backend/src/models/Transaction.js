const mongoose = require('mongoose');
const crypto = require('crypto');
const { TRANSACTION_STATUS, COMPLIANCE_STATUS } = require('../utils/constants');
const { fromDecimal128 } = require('../utils/money');

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipient',
      required: true,
    },
    senderWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    sourceCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    targetCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    exchangeRate: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    convertedAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    fee: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    totalDebited: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
    },
    failureReason: {
      type: String,
      default: '',
    },
    complianceStatus: {
      type: String,
      enum: Object.values(COMPLIANCE_STATUS),
      default: COMPLIANCE_STATUS.CLEARED,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ complianceStatus: 1 });

transactionSchema.pre('save', function () {
  if (!this.reference) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.reference = `GP-${date}-${rand}`;
  }
});

const decimalFields = [
  'amount', 'exchangeRate', 'convertedAmount', 'fee', 'totalDebited',
];

transactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    decimalFields.forEach((field) => {
      if (ret[field]) ret[field] = fromDecimal128(ret[field]);
    });
    return ret;
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);

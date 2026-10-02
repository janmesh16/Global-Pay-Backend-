const mongoose = require('mongoose');
const { WALLET_STATUS } = require('../utils/constants');
const { fromDecimal128 } = require('../utils/money');

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: mongoose.Schema.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0.00'),
      validate: {
        validator: function (v) {
          return parseFloat(v.toString()) >= 0;
        },
        message: 'Balance cannot be negative',
      },
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(WALLET_STATUS),
      default: WALLET_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    if (ret.balance) {
      ret.balance = fromDecimal128(ret.balance);
    }
    return ret;
  },
});

module.exports = mongoose.model('Wallet', walletSchema);

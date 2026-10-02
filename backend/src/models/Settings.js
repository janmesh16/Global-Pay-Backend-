const mongoose = require('mongoose');
const { SUPPORTED_CURRENCIES } = require('../utils/constants');
const { fromDecimal128 } = require('../utils/money');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
    },
    feePercent: {
      type: Number,
      default: 1.5,
      min: 0,
      max: 100,
    },
    flatFee: {
      type: Number,
      default: 0.5,
      min: 0,
    },
    minFee: {
      type: Number,
      default: 1,
      min: 0,
    },
    maxFee: {
      type: Number,
      default: 50,
    },
    minTransfer: {
      type: Number,
      default: 1,
      min: 0,
    },
    maxTransfer: {
      type: Number,
      default: 5000,
    },
    dailyLimit: {
      type: Number,
      default: 10000,
    },
    monthlyLimit: {
      type: Number,
      default: 50000,
    },
    unverifiedKycMaxTransfer: {
      type: Number,
      default: 500,
    },
    amlFlagThreshold: {
      type: Number,
      default: 3000,
    },
    blockedCountries: {
      type: [String],
      default: [],
    },
    supportedCurrencies: {
      type: [String],
      default: SUPPORTED_CURRENCIES,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

settingsSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

/**
 * Get the global settings (creates default if not exists).
 */
settingsSchema.statics.getGlobal = async function () {
  let settings = await this.findOne({ key: 'global' });
  if (!settings) {
    settings = await this.create({ key: 'global' });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

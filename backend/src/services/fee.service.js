const Settings = require('../models/Settings');
const logger = require('../utils/logger');

/**
 * Calculate fee for a transfer.
 * fee = clamp(amount × feePercent/100 + flatFee, minFee, maxFee)
 */
const calculateFee = async (amount) => {
  const settings = await Settings.getGlobal();

  let fee = (amount * settings.feePercent) / 100 + settings.flatFee;
  // Clamp
  fee = Math.max(fee, settings.minFee);
  fee = Math.min(fee, settings.maxFee);
  // Round up to 2 decimals
  fee = Math.ceil(fee * 100) / 100;

  const totalDebited = Math.round((amount + fee) * 100) / 100;

  return {
    fee,
    totalDebited,
    feePercent: settings.feePercent,
    flatFee: settings.flatFee,
  };
};

/**
 * Get fee preview for a conversion.
 */
const getFeePreview = async (amount, rate) => {
  const { fee, totalDebited, feePercent, flatFee } = await calculateFee(amount);
  const convertedAmount = Math.round(amount * rate * 100) / 100;

  return {
    amount,
    fee,
    totalDebited,
    convertedAmount,
    rate,
    feeBreakdown: {
      percent: feePercent,
      flat: flatFee,
    },
  };
};

module.exports = { calculateFee, getFeePreview };

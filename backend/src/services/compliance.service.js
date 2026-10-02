const Transaction = require('../models/Transaction');
const ComplianceLog = require('../models/ComplianceLog');
const Settings = require('../models/Settings');
const { COMPLIANCE_CHECK_TYPES, COMPLIANCE_RESULT, COMPLIANCE_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Run all compliance checks on a transfer.
 * Returns { complianceStatus, riskScore, logs }
 */
const runChecks = async (user, transfer, settings = null) => {
  if (!settings) settings = await Settings.getGlobal();

  const logs = [];
  let totalRisk = 0;
  let hasFail = false;
  let hasFlag = false;
  const amount = parseFloat(transfer.amount.toString());

  // Rule 1: KYC not verified and amount > unverifiedKycMaxTransfer
  if (user.kycStatus !== 'verified' && amount > settings.unverifiedKycMaxTransfer) {
    logs.push({
      transaction: transfer._id,
      user: user._id,
      checkType: COMPLIANCE_CHECK_TYPES.KYC,
      result: COMPLIANCE_RESULT.FAIL,
      riskScore: 0,
      reasons: [`KYC not verified. Max transfer for unverified users: ${settings.unverifiedKycMaxTransfer}`],
    });
    hasFail = true;
  }

  // Rule 2: Recipient country in blockedCountries
  const recipientCountry = transfer.recipientCountry || '';
  if (settings.blockedCountries.includes(recipientCountry)) {
    logs.push({
      transaction: transfer._id,
      user: user._id,
      checkType: COMPLIANCE_CHECK_TYPES.SANCTIONS,
      result: COMPLIANCE_RESULT.FAIL,
      riskScore: 0,
      reasons: [`Recipient country ${recipientCountry} is in the sanctions list`],
    });
    hasFail = true;
  }

  // Rule 3: Amount >= amlFlagThreshold
  if (amount >= settings.amlFlagThreshold) {
    totalRisk += 40;
    logs.push({
      transaction: transfer._id,
      user: user._id,
      checkType: COMPLIANCE_CHECK_TYPES.AML,
      result: COMPLIANCE_RESULT.FLAG,
      riskScore: 40,
      reasons: [`Transfer amount ${amount} >= AML threshold ${settings.amlFlagThreshold}`],
    });
    hasFlag = true;
  }

  // Rule 4: Velocity check - 3+ transfers in 10 minutes
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await Transaction.countDocuments({
    sender: user._id,
    createdAt: { $gte: tenMinAgo },
    _id: { $ne: transfer._id },
  });
  if (recentCount >= 2) {
    totalRisk += 25;
    logs.push({
      transaction: transfer._id,
      user: user._id,
      checkType: COMPLIANCE_CHECK_TYPES.AML,
      result: COMPLIANCE_RESULT.FLAG,
      riskScore: 25,
      reasons: [`Velocity: ${recentCount + 1} transfers in the last 10 minutes`],
    });
    hasFlag = true;
  }

  // Rule 5: Daily total over 80% of dailyLimit
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const dailyAgg = await Transaction.aggregate([
    {
      $match: {
        sender: user._id,
        createdAt: { $gte: startOfDay },
        status: { $ne: 'failed' },
      },
    },
    { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
  ]);
  const dailyTotal = (dailyAgg[0]?.total || 0) + amount;
  if (dailyTotal > settings.dailyLimit * 0.8) {
    totalRisk += 15;
    logs.push({
      transaction: transfer._id,
      user: user._id,
      checkType: COMPLIANCE_CHECK_TYPES.LIMIT,
      result: COMPLIANCE_RESULT.FLAG,
      riskScore: 15,
      reasons: [`Daily total ${dailyTotal.toFixed(2)} is over 80% of daily limit ${settings.dailyLimit}`],
    });
    hasFlag = true;
  }

  // Rule 6: New account (< 24h) sending large amount
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  if (accountAge < 24 * 60 * 60 * 1000 && amount > 100) {
    totalRisk += 20;
    logs.push({
      transaction: transfer._id,
      user: user._id,
      checkType: COMPLIANCE_CHECK_TYPES.AML,
      result: COMPLIANCE_RESULT.FLAG,
      riskScore: 20,
      reasons: ['New account (under 24h) sending a large transfer'],
    });
    hasFlag = true;
  }

  // Rule 7: Structuring - several transfers just below threshold in 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const nearThresholdCount = await Transaction.countDocuments({
    sender: user._id,
    createdAt: { $gte: oneDayAgo },
    status: { $ne: 'failed' },
    $expr: {
      $and: [
        { $gte: [{ $toDouble: '$amount' }, settings.amlFlagThreshold * 0.7] },
        { $lt: [{ $toDouble: '$amount' }, settings.amlFlagThreshold] },
      ],
    },
  });
  if (nearThresholdCount >= 2) {
    totalRisk += 30;
    logs.push({
      transaction: transfer._id,
      user: user._id,
      checkType: COMPLIANCE_CHECK_TYPES.AML,
      result: COMPLIANCE_RESULT.FLAG,
      riskScore: 30,
      reasons: [`Possible structuring: ${nearThresholdCount} transfers just below threshold in 24h`],
    });
    hasFlag = true;
  }

  // If no checks triggered, add a pass log
  if (logs.length === 0) {
    logs.push({
      transaction: transfer._id,
      user: user._id,
      checkType: COMPLIANCE_CHECK_TYPES.AML,
      result: COMPLIANCE_RESULT.PASS,
      riskScore: 0,
      reasons: ['All compliance checks passed'],
    });
  }

  // Save all logs
  await ComplianceLog.insertMany(logs);

  // Determine final status
  const riskScore = Math.min(totalRisk, 100);
  let complianceStatus;
  if (hasFail) {
    complianceStatus = COMPLIANCE_STATUS.REJECTED;
  } else if (hasFlag) {
    complianceStatus = COMPLIANCE_STATUS.FLAGGED;
  } else {
    complianceStatus = COMPLIANCE_STATUS.CLEARED;
  }

  logger.info(`[compliance] Transfer ${transfer._id}: ${complianceStatus} (risk: ${riskScore})`);
  return { complianceStatus, riskScore, logs };
};

module.exports = { runChecks };

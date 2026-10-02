const Joi = require('joi');
const { KYC_STATUS, USER_STATUS } = require('../utils/constants');

const reviewComplianceSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  note: Joi.string().trim().max(500).optional().allow(''),
});

const updateKycSchema = Joi.object({
  kycStatus: Joi.string().valid(...Object.values(KYC_STATUS)).required(),
});

const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(USER_STATUS)).required(),
});

const updateSettingsSchema = Joi.object({
  feePercent: Joi.number().min(0).max(100).optional(),
  flatFee: Joi.number().min(0).optional(),
  minFee: Joi.number().min(0).optional(),
  maxFee: Joi.number().min(0).optional(),
  dailyLimit: Joi.number().positive().optional(),
  monthlyLimit: Joi.number().positive().optional(),
  unverifiedKycMaxTransfer: Joi.number().positive().optional(),
  amlFlagThreshold: Joi.number().positive().optional(),
  blockedCountries: Joi.array().items(Joi.string().uppercase().length(2)).optional(),
});

module.exports = {
  reviewComplianceSchema,
  updateKycSchema,
  updateUserStatusSchema,
  updateSettingsSchema,
};

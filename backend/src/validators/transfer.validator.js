const Joi = require('joi');
const { SUPPORTED_CURRENCIES } = require('../utils/constants');

const createTransferSchema = Joi.object({
  recipientId: Joi.string().hex().length(24).required()
    .messages({ 'string.length': 'Invalid recipient ID' }),
  amount: Joi.number().positive().max(50000).required()
    .messages({ 'number.positive': 'Transfer amount must be positive' }),
  sourceCurrency: Joi.string().uppercase().valid(...SUPPORTED_CURRENCIES).required(),
  targetCurrency: Joi.string().uppercase().valid(...SUPPORTED_CURRENCIES).required(),
  idempotencyKey: Joi.string().trim().max(100).optional(),
});

const getTransfersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().optional(),
  recipientId: Joi.string().hex().length(24).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

module.exports = {
  createTransferSchema,
  getTransfersQuerySchema,
};

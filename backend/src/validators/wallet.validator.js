const Joi = require('joi');

const addFundsSchema = Joi.object({
  amount: Joi.number().positive().max(50000).required()
    .messages({ 'number.positive': 'Amount must be positive' }),
  method: Joi.string().valid('bank_transfer', 'card', 'upi').default('bank_transfer'),
});

const ledgerQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().default('-createdAt'),
});

module.exports = { addFundsSchema, ledgerQuerySchema };

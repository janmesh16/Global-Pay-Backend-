const Joi = require('joi');

const createRecipientSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional(),
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().lowercase().optional().allow(''),
  phone: Joi.string().trim().optional().allow(''),
  country: Joi.string().uppercase().length(2).required(),
  currency: Joi.string().uppercase().length(3).required(),
  bankName: Joi.string().trim().optional().allow(''),
  accountNumber: Joi.string().trim().required(),
  ifscOrSwift: Joi.string().trim().uppercase().optional().allow(''),
  routingNumber: Joi.string().trim().uppercase().optional().allow(''),
}).or('fullName', 'name');

const updateRecipientSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional(),
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().lowercase().optional().allow(''),
  phone: Joi.string().trim().optional().allow(''),
  country: Joi.string().uppercase().length(2).optional(),
  currency: Joi.string().uppercase().length(3).optional(),
  bankName: Joi.string().trim().optional(),
  accountNumber: Joi.string().trim().optional(),
  ifscOrSwift: Joi.string().trim().uppercase().optional(),
  routingNumber: Joi.string().trim().uppercase().optional().allow(''),
}).min(1);

const listRecipientQuerySchema = Joi.object({
  country: Joi.string().uppercase().length(2).optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { createRecipientSchema, updateRecipientSchema, listRecipientQuerySchema };

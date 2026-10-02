const Joi = require('joi');

const ratesQuerySchema = Joi.object({
  from: Joi.string().uppercase().length(3).required(),
  to: Joi.string().uppercase().length(3).optional(),
});

const convertQuerySchema = Joi.object({
  from: Joi.string().uppercase().length(3).required(),
  to: Joi.string().uppercase().length(3).required(),
  amount: Joi.number().positive().required(),
});

module.exports = { ratesQuerySchema, convertQuerySchema };

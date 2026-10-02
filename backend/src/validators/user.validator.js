const Joi = require('joi');

const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().trim().optional(),
});

const submitKycSchema = Joi.object({
  documentType: Joi.string().valid('passport', 'national_id', 'driving_license').required(),
  documentNumber: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
});

const deviceTokenSchema = Joi.object({
  deviceToken: Joi.string().trim().required(),
});

module.exports = {
  updateProfileSchema,
  submitKycSchema,
  deviceTokenSchema,
};

const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required(),
  country: Joi.string().uppercase().length(2).required(),
  phone: Joi.string().trim().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const firebaseSchema = Joi.object({
  idToken: Joi.string().required(),
});

const fcmTokenSchema = Joi.object({
  token: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, firebaseSchema, fcmTokenSchema };

const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendCreated(res, 'User registered successfully', result);
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, 'Login successful', result);
});

/**
 * POST /api/auth/firebase
 */
const firebaseAuth = asyncHandler(async (req, res) => {
  const result = await authService.firebaseLogin(req.body.idToken);
  sendSuccess(res, 'Firebase authentication successful', result);
});

/**
 * GET /api/auth/me
 */
const me = asyncHandler(async (req, res) => {
  sendSuccess(res, 'Current user profile', req.user.toJSON());
});

/**
 * POST /api/auth/fcm-token
 */
const addFcmToken = asyncHandler(async (req, res) => {
  await authService.addFcmToken(req.user._id, req.body.token);
  sendSuccess(res, 'FCM token registered');
});

/**
 * DELETE /api/auth/fcm-token
 */
const removeFcmToken = asyncHandler(async (req, res) => {
  await authService.removeFcmToken(req.user._id, req.body.token);
  sendSuccess(res, 'FCM token removed');
});

module.exports = { register, login, firebaseAuth, me, addFcmToken, removeFcmToken };

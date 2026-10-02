const User = require('../models/User');
const Wallet = require('../models/Wallet');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { KYC_STATUS } = require('../utils/constants');

/**
 * Get current user profile and wallet.
 * GET /api/users/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const wallet = await Wallet.findOne({ user: req.user._id });
  sendSuccess(res, 'User profile retrieved', { user: user.toJSON(), wallet: wallet ? wallet.toJSON() : null });
});

/**
 * Update user profile details.
 * PATCH /api/users/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  const updates = {};
  if (fullName) updates.name = fullName;
  if (phone) updates.phone = phone;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { returnDocument: 'after' }).select('-password');
  sendSuccess(res, 'Profile updated successfully', user);
});

/**
 * Submit KYC documentation.
 * POST /api/users/kyc
 */
const submitKyc = asyncHandler(async (req, res) => {
  const { documentType, documentNumber, country } = req.body;
  const user = await User.findById(req.user._id);

  user.kycStatus = KYC_STATUS.PENDING;
  user.kycDocuments = {
    type: documentType,
    number: documentNumber,
    submittedAt: new Date(),
  };
  if (country) user.country = country;

  await user.save();
  sendSuccess(res, 'KYC submitted for verification', { kycStatus: user.kycStatus });
});

/**
 * Register FCM Device Token for Push Notifications.
 * POST /api/users/device-token
 */
const registerDeviceToken = asyncHandler(async (req, res) => {
  const { deviceToken } = req.body;
  const user = await User.findById(req.user._id);

  if (!user.fcmTokens.includes(deviceToken)) {
    user.fcmTokens.push(deviceToken);
    await user.save();
  }

  sendSuccess(res, 'Device token registered successfully', { deviceTokensCount: user.fcmTokens.length });
});

module.exports = {
  getProfile,
  updateProfile,
  submitKyc,
  registerDeviceToken,
};

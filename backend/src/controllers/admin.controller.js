const adminService = require('../services/admin.service');
const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

/**
 * Get aggregated dashboard metrics.
 * GET /api/admin/metrics
 */
const getMetrics = asyncHandler(async (req, res) => {
  const metrics = await adminService.getMetrics();
  sendSuccess(res, 'Admin dashboard metrics retrieved', metrics);
});

/**
 * List all transfers.
 * GET /api/admin/transfers
 */
const getTransfers = asyncHandler(async (req, res) => {
  const { transfers, pagination } = await adminService.getAdminTransfers(req.query);
  sendSuccess(res, 'Admin transfers list retrieved', { transfers, pagination });
});

/**
 * Approve or reject a flagged transfer.
 * PATCH /api/admin/transfers/:id/compliance
 */
const reviewTransferCompliance = asyncHandler(async (req, res) => {
  const transfer = await adminService.reviewTransferCompliance(req.params.id, {
    action: req.body.action,
    note: req.body.note,
    adminId: req.user._id,
  });
  sendSuccess(res, `Transfer compliance review action '${req.body.action}' completed`, transfer);
});

/**
 * List all users.
 * GET /api/admin/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await adminService.getAdminUsers(req.query);
  sendSuccess(res, 'Users list retrieved', { users, pagination });
});

/**
 * Update user KYC status.
 * PATCH /api/admin/users/:id/kyc
 */
const updateUserKyc = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserKyc(req.params.id, req.body);
  sendSuccess(res, 'User KYC status updated successfully', user);
});

/**
 * Update user account status (active, suspended, blocked).
 * PATCH /api/admin/users/:id/status
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(req.params.id, req.body);
  sendSuccess(res, 'User account status updated successfully', user);
});

/**
 * Get global settings.
 * GET /api/admin/settings
 */
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getGlobal();
  sendSuccess(res, 'Global settings retrieved', settings);
});

/**
 * Update global settings.
 * PUT /api/admin/settings
 */
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.updateSettings(req.body);
  sendSuccess(res, 'Global settings updated successfully', settings);
});

module.exports = {
  getMetrics,
  getTransfers,
  reviewTransferCompliance,
  getUsers,
  updateUserKyc,
  updateUserStatus,
  getSettings,
  updateSettings,
};

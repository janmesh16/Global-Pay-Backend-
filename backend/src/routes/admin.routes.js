const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  reviewComplianceSchema,
  updateKycSchema,
  updateUserStatusSchema,
  updateSettingsSchema,
} = require('../validators/admin.validator');

// All admin routes require authentication & admin role
router.use(auth.authenticate, auth.requireRole('admin'));

router.get('/metrics', adminController.getMetrics);
router.get('/reports', adminController.getMetrics);
router.get('/transfers', adminController.getTransfers);
router.get('/transactions', adminController.getTransfers);
router.patch('/transfers/:id/compliance', validate(reviewComplianceSchema), adminController.reviewTransferCompliance);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/kyc', validate(updateKycSchema), adminController.updateUserKyc);
router.patch('/users/:id/status', validate(updateUserStatusSchema), adminController.updateUserStatus);

router.get('/settings', adminController.getSettings);
router.put('/settings', validate(updateSettingsSchema), adminController.updateSettings);
router.put('/limits', validate(updateSettingsSchema), adminController.updateSettings);

module.exports = router;

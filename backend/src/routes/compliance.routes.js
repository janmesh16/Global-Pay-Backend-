const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const auth = require('../middleware/auth');

// Compliance endpoints require admin authentication
router.use(auth.authenticate, auth.requireRole('admin'));

router.get('/logs', complianceController.getComplianceLogs);
router.get('/flagged', complianceController.getFlaggedTransactions);
router.post('/verify', complianceController.verifyCompliance);

module.exports = router;

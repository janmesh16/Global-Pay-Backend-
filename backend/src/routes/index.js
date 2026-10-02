const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const walletRoutes = require('./wallet.routes');
const currencyRoutes = require('./currency.routes');
const recipientRoutes = require('./recipient.routes');
const transferRoutes = require('./transfer.routes');
const adminRoutes = require('./admin.routes');
const complianceRoutes = require('./compliance.routes');

// Mount modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/currency', currencyRoutes);
router.use('/recipients', recipientRoutes);
router.use('/transfers', transferRoutes);
router.use('/admin', adminRoutes);
router.use('/compliance', complianceRoutes);

module.exports = router;

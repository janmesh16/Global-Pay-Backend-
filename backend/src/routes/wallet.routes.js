const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { transferLimiter } = require('../middleware/rateLimiter');
const { addFundsSchema, ledgerQuerySchema } = require('../validators/wallet.validator');

// All routes require authentication
router.use(auth);

router.get('/', walletController.getWallet);
router.post('/add-funds', transferLimiter, validate(addFundsSchema), walletController.addFunds);
router.post('/fund', transferLimiter, validate(addFundsSchema), walletController.addFunds);
router.get('/balance', walletController.getBalance);
router.get('/ledger', validate(ledgerQuerySchema, 'query'), walletController.getLedger);

module.exports = router;

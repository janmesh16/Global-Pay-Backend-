const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTransferSchema, getTransfersQuerySchema } = require('../validators/transfer.validator');

// All transfer routes require authentication
router.use(auth);

router.post('/', validate(createTransferSchema), transferController.createTransfer);
router.get('/', validate(getTransfersQuerySchema, 'query'), transferController.getTransfers);
router.get('/status/:id', transferController.getTransferStatus);
router.get('/:id', transferController.getTransferById);
router.post('/:id/cancel', transferController.cancelTransfer);

module.exports = router;

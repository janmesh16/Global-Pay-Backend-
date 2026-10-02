const express = require('express');
const router = express.Router();
const recipientController = require('../controllers/recipient.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createRecipientSchema,
  updateRecipientSchema,
  listRecipientQuerySchema,
} = require('../validators/recipient.validator');

router.use(auth);

router.post('/', validate(createRecipientSchema), recipientController.createRecipient);
router.get('/', validate(listRecipientQuerySchema, 'query'), recipientController.listRecipients);
router.get('/:id', recipientController.getRecipient);
router.put('/:id', validate(updateRecipientSchema), recipientController.updateRecipient);
router.delete('/:id', recipientController.deleteRecipient);

module.exports = router;

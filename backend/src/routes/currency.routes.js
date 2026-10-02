const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currency.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ratesQuerySchema, convertQuerySchema } = require('../validators/currency.validator');

router.use(auth);

router.get('/rates', validate(ratesQuerySchema, 'query'), currencyController.getRates);
router.get('/convert', validate(convertQuerySchema, 'query'), currencyController.convert);

module.exports = router;

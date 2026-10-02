const currencyService = require('../services/currency.service');
const feeService = require('../services/fee.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/currency/rates
 */
const getRates = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const result = await currencyService.getRates(from, to);
  sendSuccess(res, 'Exchange rates', result);
});

/**
 * GET /api/currency/convert
 */
const convert = asyncHandler(async (req, res) => {
  const { from, to, amount } = req.query;
  const { rate, source, timestamp } = await currencyService.getRate(from, to);
  const preview = await feeService.getFeePreview(parseFloat(amount), rate);
  sendSuccess(res, 'Conversion preview', { ...preview, source, timestamp });
});

module.exports = { getRates, convert };

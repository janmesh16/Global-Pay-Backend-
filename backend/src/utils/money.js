const mongoose = require('mongoose');

/**
 * Money utility helpers for safe Decimal128 operations.
 * Never use floating-point arithmetic for balances.
 */

/**
 * Convert a value to Mongoose Decimal128.
 * @param {string|number|mongoose.Types.Decimal128} value
 * @returns {mongoose.Types.Decimal128}
 */
const toDecimal128 = (value) => {
  if (value instanceof mongoose.Types.Decimal128) return value;
  return mongoose.Types.Decimal128.fromString(String(value));
};

/**
 * Convert Decimal128 to a plain number string (for JSON responses).
 * @param {mongoose.Types.Decimal128} decimal
 * @returns {string}
 */
const fromDecimal128 = (decimal) => {
  if (!decimal) return '0';
  if (decimal instanceof mongoose.Types.Decimal128) {
    return decimal.toString();
  }
  return String(decimal);
};

/**
 * Convert Decimal128 to a JavaScript number (only for display, NOT for arithmetic).
 * @param {mongoose.Types.Decimal128} decimal
 * @returns {number}
 */
const toNumber = (decimal) => {
  return parseFloat(fromDecimal128(decimal));
};

/**
 * Add two Decimal128 values.
 * Using string-based arithmetic to avoid floating point.
 */
const addDecimals = (a, b) => {
  const numA = parseFloat(fromDecimal128(a));
  const numB = parseFloat(fromDecimal128(b));
  // Round to 2 decimal places to avoid floating point drift
  const result = Math.round((numA + numB) * 100) / 100;
  return toDecimal128(result.toFixed(2));
};

/**
 * Subtract b from a.
 */
const subtractDecimals = (a, b) => {
  const numA = parseFloat(fromDecimal128(a));
  const numB = parseFloat(fromDecimal128(b));
  const result = Math.round((numA - numB) * 100) / 100;
  return toDecimal128(result.toFixed(2));
};

/**
 * Multiply two Decimal128 values (e.g. amount * rate).
 */
const multiplyDecimals = (a, b) => {
  const numA = parseFloat(fromDecimal128(a));
  const numB = parseFloat(fromDecimal128(b));
  const result = Math.round(numA * numB * 100) / 100;
  return toDecimal128(result.toFixed(2));
};

/**
 * Compare: returns -1, 0, or 1.
 */
const compareDecimals = (a, b) => {
  const numA = parseFloat(fromDecimal128(a));
  const numB = parseFloat(fromDecimal128(b));
  if (numA < numB) return -1;
  if (numA > numB) return 1;
  return 0;
};

/**
 * Clamp fee between min and max, rounding up to 2 decimals.
 */
const clampFee = (fee, min, max) => {
  const feeNum = parseFloat(fromDecimal128(fee));
  const minNum = parseFloat(fromDecimal128(min));
  const maxNum = parseFloat(fromDecimal128(max));
  const clamped = Math.min(Math.max(feeNum, minNum), maxNum);
  // Round up to 2 decimals (ceil)
  const rounded = Math.ceil(clamped * 100) / 100;
  return toDecimal128(rounded.toFixed(2));
};

module.exports = {
  toDecimal128,
  fromDecimal128,
  toNumber,
  addDecimals,
  subtractDecimals,
  multiplyDecimals,
  compareDecimals,
  clampFee,
};

/**
 * Standardized API response helpers.
 * Envelope format: { success: bool, message: string, data?: any, errors?: [] }
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {*} data
 * @param {number} statusCode
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201).
 */
const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {Array} errors
 */
const sendError = (res, message, statusCode = 500, errors = []) => {
  const response = { success: false, message };
  if (errors.length > 0) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendCreated, sendError };

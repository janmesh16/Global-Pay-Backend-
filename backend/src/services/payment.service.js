const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Simulated payment gateway service.
 * Abstracts top-up payment processing behind an interface so a real
 * gateway (Stripe, Razorpay) can be plugged in later.
 */

/**
 * Process a simulated top-up payment.
 * @param {{ amount: number, currency: string, method: string, userId: string }} params
 * @returns {{ success: boolean, reference: string, message: string }}
 */
const processTopUp = async ({ amount, currency, method, userId }) => {
  // Simulate gateway processing delay
  logger.info(`[payment] Processing top-up: ${amount} ${currency} via ${method} for user ${userId}`);

  // Always succeeds in simulation mode
  const reference = `PAY-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  return {
    success: true,
    reference,
    message: 'Payment processed successfully (simulated)',
  };
};

module.exports = { processTopUp };

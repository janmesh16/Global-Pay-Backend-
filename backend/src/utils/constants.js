/**
 * Application-wide constants
 */

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
};

const KYC_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

const WALLET_STATUS = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
};

const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const COMPLIANCE_STATUS = {
  CLEARED: 'cleared',
  FLAGGED: 'flagged',
  REJECTED: 'rejected',
};

const COMPLIANCE_CHECK_TYPES = {
  KYC: 'KYC',
  AML: 'AML',
  LIMIT: 'LIMIT',
  SANCTIONS: 'SANCTIONS',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
};

const COMPLIANCE_RESULT = {
  PASS: 'pass',
  FLAG: 'flag',
  FAIL: 'fail',
};

const LEDGER_TYPES = {
  CREDIT_TOPUP: 'credit_topup',
  DEBIT_TRANSFER: 'debit_transfer',
  CREDIT_REFUND: 'credit_refund',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
};

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'INR', 'AED', 'CAD', 'AUD', 'JPY', 'SGD',
];

module.exports = {
  ROLES,
  USER_STATUS,
  KYC_STATUS,
  WALLET_STATUS,
  TRANSACTION_STATUS,
  COMPLIANCE_STATUS,
  COMPLIANCE_CHECK_TYPES,
  COMPLIANCE_RESULT,
  LEDGER_TYPES,
  SUPPORTED_CURRENCIES,
};

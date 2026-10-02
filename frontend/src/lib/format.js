import Decimal from 'decimal.js';

export function formatMoney(amount, currency = 'USD') {
  if (amount === undefined || amount === null || amount === '') return '0.00';
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  if (isNaN(numeric)) return '0.00';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch (e) {
    return `${currency} ${numeric.toFixed(2)}`;
  }
}

export function formatNumber(amount, decimals = 2) {
  if (amount === undefined || amount === null || amount === '') return '0.00';
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  if (isNaN(numeric)) return '0.00';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numeric);
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function maskAccount(accountNumber) {
  if (!accountNumber) return '••••';
  const str = String(accountNumber).trim();
  if (str.length <= 4) return str;
  return `•••• ${str.slice(-4)}`;
}

// Decimal.js precision helper for display preview calculations
export function safeAdd(a, b) {
  return new Decimal(a || 0).plus(b || 0).toFixed(2);
}

export function safeMultiply(a, b) {
  return new Decimal(a || 0).times(b || 0).toFixed(4);
}

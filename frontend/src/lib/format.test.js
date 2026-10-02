import { describe, it, expect } from 'vitest';
import { formatMoney, maskAccount, safeAdd, safeMultiply } from './format';

describe('format.js utilities', () => {
  it('formats money correctly with string inputs', () => {
    expect(formatMoney('1234.50', 'USD')).toContain('1,234.50');
    expect(formatMoney(0, 'USD')).toContain('0.00');
  });

  it('masks account numbers safely', () => {
    expect(maskAccount('1234567890')).toBe('•••• 7890');
    expect(maskAccount('1234')).toBe('1234');
    expect(maskAccount(null)).toBe('••••');
  });

  it('performs precise decimal math with Decimal.js without floating point loss', () => {
    expect(safeAdd('0.1', '0.2')).toBe('0.30');
    expect(safeMultiply('10.50', '0.005')).toBe('0.0525');
  });
});

import React from 'react';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';

export function MoneyText({ amount, currency = 'USD', className, showCurrency = true }) {
  const formatted = formatMoney(amount, currency);

  return (
    <span className={cn('font-money font-semibold tracking-tight', className)}>
      {formatted}
      {!showCurrency && ''}
    </span>
  );
}

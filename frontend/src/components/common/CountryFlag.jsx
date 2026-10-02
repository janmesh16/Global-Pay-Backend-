import React from 'react';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';

export function CountryFlag({ code, name, className = 'text-lg' }) {
  const country = SUPPORTED_COUNTRIES.find(
    (c) => c.code.toLowerCase() === (code || '').toLowerCase()
  );

  const flag = country?.flag || '🌐';
  const label = name || country?.name || code;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} title={label}>
      <span>{flag}</span>
    </span>
  );
}

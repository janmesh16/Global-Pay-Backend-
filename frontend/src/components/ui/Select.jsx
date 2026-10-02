import React from 'react';
import { cn } from '@/lib/cn';

export const Select = React.forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      options = [],
      children,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-9 transition-all duration-150',
              error && 'border-rose-500 focus:ring-rose-500',
              className
            )}
            {...props}
          >
            {children
              ? children
              : options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100"
                  >
                    {opt.label}
                  </option>
                ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

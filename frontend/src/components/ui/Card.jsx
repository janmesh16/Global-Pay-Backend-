import React from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm text-slate-900 dark:text-slate-100 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 border-b border-slate-100 dark:border-slate-800/60', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-lg font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-slate-500 dark:text-slate-400', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

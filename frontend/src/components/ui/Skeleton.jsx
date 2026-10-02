import React from 'react';
import { cn } from '@/lib/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800/80', className)}
      {...props}
    />
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-brand-400">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold font-money">404</h1>
        <h2 className="text-xl font-semibold">Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <NavLink to="/app">
          <Button variant="primary" className="mt-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Return to Dashboard
          </Button>
        </NavLink>
      </div>
    </div>
  );
}

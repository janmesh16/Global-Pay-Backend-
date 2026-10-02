import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, token } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-navy-950 p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-brand-500 animate-bounce flex items-center justify-center text-white font-extrabold text-xl">
            GP
          </div>
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-3 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

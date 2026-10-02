import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export function RoleRoute({ role = 'admin', children }) {
  const { user } = useAuthStore();

  if (user?.role !== role) {
    toast.error('Access restricted. Admin privileges required.');
    return <Navigate to="/app" replace />;
  }

  return children;
}

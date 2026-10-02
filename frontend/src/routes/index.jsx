import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppShell } from '@/components/layout/AppShell';
import { AdminShell } from '@/components/layout/AdminShell';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/auth.store';

// Lazy loaded page components
const Landing = lazy(() => import('@/pages/public/Landing').then((m) => ({ default: m.Landing })));
const Login = lazy(() => import('@/pages/public/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/public/Register').then((m) => ({ default: m.Register })));
const NotFound = lazy(() => import('@/pages/public/NotFound').then((m) => ({ default: m.NotFound })));

// User App Pages
const Dashboard = lazy(() => import('@/pages/user/Dashboard').then((m) => ({ default: m.Dashboard })));
const WalletPage = lazy(() => import('@/pages/user/WalletPage').then((m) => ({ default: m.WalletPage })));
const SendMoneyWizardPage = lazy(() => import('@/pages/user/SendMoneyWizardPage').then((m) => ({ default: m.SendMoneyWizardPage })));
const TransfersPage = lazy(() => import('@/pages/user/TransfersPage').then((m) => ({ default: m.TransfersPage })));
const TransferDetailPage = lazy(() => import('@/pages/user/TransferDetailPage').then((m) => ({ default: m.TransferDetailPage })));
const RecipientsPage = lazy(() => import('@/pages/user/RecipientsPage').then((m) => ({ default: m.RecipientsPage })));
const RatesPage = lazy(() => import('@/pages/user/RatesPage').then((m) => ({ default: m.RatesPage })));
const KycPage = lazy(() => import('@/pages/user/KycPage').then((m) => ({ default: m.KycPage })));
const NotificationsPage = lazy(() => import('@/pages/user/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage').then((m) => ({ default: m.ProfilePage })));

// Admin Console Pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })));
const TransactionsPage = lazy(() => import('@/pages/admin/TransactionsPage').then((m) => ({ default: m.TransactionsPage })));
const CompliancePage = lazy(() => import('@/pages/admin/CompliancePage').then((m) => ({ default: m.CompliancePage })));
const LimitsPage = lazy(() => import('@/pages/admin/LimitsPage').then((m) => ({ default: m.LimitsPage })));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })));

function GuestOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/app'} replace />;
  }
  return children;
}

function PageLoader() {
  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <Login />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <Register />
            </GuestOnlyRoute>
          }
        />

        {/* Protected User App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="send" element={<SendMoneyWizardPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="transfers/:id" element={<TransferDetailPage />} />
          <Route path="recipients" element={<RecipientsPage />} />
          <Route path="rates" element={<RatesPage />} />
          <Route path="kyc" element={<KycPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Protected Admin Console Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <AdminShell />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="limits" element={<LimitsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

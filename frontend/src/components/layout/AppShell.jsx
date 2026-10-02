import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { useAuthStore } from '@/store/auth.store';
import { AlertCircle } from 'lucide-react';

export function AppShell() {
  useSocketEvents();
  const { user } = useAuthStore();
  const kycStatus = user?.kycStatus || 'unverified';

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Topbar />

        {/* KYC Alert Banner if unverified */}
        {kycStatus === 'unverified' && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Your KYC verification is incomplete. Verify now to unlock higher transfer limits.</span>
            </div>
            <a href="/app/kyc" className="underline font-bold hover:text-slate-900 shrink-0 ml-2">
              Verify KYC
            </a>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}

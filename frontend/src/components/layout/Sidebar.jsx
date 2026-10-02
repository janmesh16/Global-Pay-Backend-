import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Send,
  History,
  Users,
  TrendingUp,
  FileCheck,
  Bell,
  User,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/auth.store';

export function Sidebar({ className }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const userNavItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'Send Money', path: '/app/send', icon: Send, highlight: true },
    { label: 'Wallet', path: '/app/wallet', icon: Wallet },
    { label: 'Transfers', path: '/app/transfers', icon: History },
    { label: 'Recipients', path: '/app/recipients', icon: Users },
    { label: 'Rates', path: '/app/rates', icon: TrendingUp },
    { label: 'KYC Status', path: '/app/kyc', icon: FileCheck },
    { label: 'Notifications', path: '/app/notifications', icon: Bell },
    { label: 'Profile', path: '/app/profile', icon: User },
  ];

  return (
    <aside
      className={cn(
        'w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 flex flex-col justify-between p-4',
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 font-extrabold text-xl">
            GP
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight leading-none">
              Global<span className="text-brand-500">Pay</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Cross-Border Hub
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {userNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm font-semibold'
                      : item.highlight
                      ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 hover:bg-brand-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Quick Switch link if user is admin */}
      {isAdmin && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <NavLink
            to="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Admin Console</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
}

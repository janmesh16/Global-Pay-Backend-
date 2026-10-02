import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Sun, Moon, LogOut, Wallet, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useUiStore } from '@/store/ui.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { MoneyText } from '@/components/common/MoneyText';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  const { user, logout } = useAuth();
  const { balance, currency, isFrozen } = useWallet();
  const { theme, toggleTheme, toggleSidebar } = useUiStore();
  const { unreadCount } = useNotificationsStore();
  const { isConnected } = useSocketEvents();

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Button>

        {/* Realtime Live socket status indicator */}
        <div
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          title={isConnected ? 'Connected to real-time server' : 'Disconnected from real-time server'}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Balance Chip */}
        <NavLink
          to="/app/wallet"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-slate-900 dark:text-slate-100 hover:bg-brand-100 transition-colors"
        >
          <Wallet className="w-4 h-4 text-brand-500" />
          <div className="flex items-baseline gap-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Balance:</span>
            <MoneyText amount={balance} currency={currency} className="text-brand-600 dark:text-brand-400 font-bold" />
          </div>
          {isFrozen && <StatusBadge status="frozen" className="text-[10px] py-0 px-1.5" />}
        </NavLink>

        {/* Notification Bell */}
        <NavLink
          to="/app/notifications"
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="rounded-xl"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </Button>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center uppercase border border-brand-300 dark:border-brand-700">
            {user?.name?.[0] || 'U'}
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:inline max-w-[100px] truncate">
            {user?.name || 'User'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Log Out"
            className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

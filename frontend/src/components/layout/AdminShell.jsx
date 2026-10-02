import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  ArrowLeftRight,
  Sliders,
  BarChart3,
  LogOut,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/ui.store';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function AdminShell() {
  useSocketEvents();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();

  const adminNav = [
    { label: 'KPI Dashboard', path: '/admin', icon: BarChart3 },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Transactions', path: '/admin/transactions', icon: ArrowLeftRight },
    { label: 'Compliance & AML', path: '/admin/compliance', icon: ShieldAlert },
    { label: 'Fees & Limits', path: '/admin/limits', icon: Sliders },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-800 bg-navy-950 flex flex-col justify-between p-4 hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-purple-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg tracking-tight leading-none">
                Admin<span className="text-purple-400">Console</span>
              </h1>
              <p className="text-[10px] text-purple-300 font-semibold tracking-wider uppercase mt-0.5">
                GlobalPay Admin
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => navigate('/app')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to User App
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Log Out Admin
          </Button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-slate-950">
        {/* Topbar */}
        <header className="h-16 shrink-0 border-b border-slate-800 bg-navy-950/90 px-4 sm:px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-xs font-bold uppercase tracking-wider">
              Administrator Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-400 hover:text-white">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
              <span className="font-semibold text-slate-200">{user?.email || 'admin@globalpay.com'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

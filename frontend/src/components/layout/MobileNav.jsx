import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Send, History, User } from 'lucide-react';
import { cn } from '@/lib/cn';

export function MobileNav() {
  const items = [
    { label: 'Home', path: '/app', icon: LayoutDashboard },
    { label: 'Wallet', path: '/app/wallet', icon: Wallet },
    { label: 'Send', path: '/app/send', icon: Send, highlight: true },
    { label: 'History', path: '/app/transfers', icon: History },
    { label: 'Profile', path: '/app/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 flex items-center justify-around z-40 px-2 shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-brand-500 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
                item.highlight && 'text-brand-500'
              )
            }
          >
            {item.highlight ? (
              <div className="h-9 w-9 rounded-full bg-brand-500 text-white flex items-center justify-center -mt-4 shadow-md shadow-brand-500/30">
                <Icon className="w-5 h-5" />
              </div>
            ) : (
              <Icon className="w-5 h-5" />
            )}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

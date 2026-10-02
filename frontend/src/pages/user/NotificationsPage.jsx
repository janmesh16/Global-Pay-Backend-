import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNotificationsStore } from '@/store/notifications.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';
import { Bell, CheckCheck, Trash2, ExternalLink } from 'lucide-react';

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationsStore();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Notification Inbox
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Realtime updates for your transfers, KYC updates, and account alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-rose-500 hover:bg-rose-50">
              <Trash2 className="w-4 h-4 mr-1" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="px-0 pb-0">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Inbox is empty"
              description="You have no notifications at this time."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                    item.read
                      ? 'bg-white dark:bg-navy-900'
                      : 'bg-brand-50/40 dark:bg-brand-950/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
                        item.read ? 'bg-slate-300 dark:bg-slate-700' : 'bg-brand-500 animate-pulse'
                      }`}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{item.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>

                  {item.link && (
                    <NavLink to={item.link}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink className="w-4 h-4 text-brand-500" />
                      </Button>
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

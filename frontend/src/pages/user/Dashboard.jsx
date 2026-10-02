import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Send, Plus, ArrowUpRight, ShieldCheck, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useTransfers } from '@/hooks/useTransfers';
import { useRates } from '@/hooks/useRates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MoneyText } from '@/components/common/MoneyText';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';
import { AddFundsModal } from './components/AddFundsModal';

export function Dashboard() {
  const { user } = useAuth();
  const { balance, currency, isLoading: isWalletLoading } = useWallet();
  const { transfers, isLoading: isTransfersLoading } = useTransfers({ page: 1, limit: 5 });
  const { rates, isLoading: isRatesLoading, refetch: refetchRates } = useRates('USD');
  const [addFundsOpen, setAddFundsOpen] = useState(false);

  const kycStatus = user?.kycStatus || 'unverified';

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Here's an overview of your wallet balance and recent activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setAddFundsOpen(true)}>
            <Plus className="w-4 h-4" /> Add Funds
          </Button>
          <NavLink to="/app/send">
            <Button variant="primary">
              <Send className="w-4 h-4" /> Send Money
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Balance & Wallet Card (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
            <CardContent className="p-6 sm:p-8 space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Available Wallet Balance
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                  {currency} Wallet
                </span>
              </div>

              <div>
                {isWalletLoading ? (
                  <Skeleton className="h-10 w-48 bg-slate-700/50" />
                ) : (
                  <MoneyText amount={balance} currency={currency} className="text-4xl sm:text-5xl text-white font-extrabold" />
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>KYC Status: <span className="font-semibold capitalize">{kycStatus}</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="amber" onClick={() => setAddFundsOpen(true)}>
                    <Plus className="w-4 h-4" /> Deposit
                  </Button>
                  <NavLink to="/app/send">
                    <Button size="sm" className="bg-white text-navy-900 hover:bg-slate-100 font-semibold">
                      <Send className="w-4 h-4" /> Transfer
                    </Button>
                  </NavLink>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transfers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle>Recent Transfers</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
              <NavLink to="/app/transfers" className="text-xs font-semibold text-brand-500 hover:underline flex items-center">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </NavLink>
            </CardHeader>

            <CardContent className="px-0 pb-2">
              {isTransfersLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : transfers.length === 0 ? (
                <EmptyState
                  title="No transfers yet"
                  description="You haven't initiated any cross-border transfers."
                  actionLabel="Send Money Now"
                  onAction={() => window.location.href = '/app/send'}
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transfers.slice(0, 5).map((t) => {
                    const recipientName = t.recipient?.name || t.recipientName || 'Recipient';
                    const targetCurr = t.targetCurrency || t.recipient?.currency || 'USD';
                    return (
                      <NavLink
                        key={t._id || t.id}
                        to={`/app/transfers/${t._id || t.id}`}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs uppercase">
                            {recipientName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {recipientName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Ref: #{t.reference || (t._id || t.id).slice(-8)} • {formatDate(t.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            <MoneyText amount={t.sourceAmount || t.amount} currency={t.sourceCurrency || 'USD'} />
                          </div>
                          <div className="flex items-center justify-end gap-1.5">
                            <StatusBadge status={t.status} className="text-[10px] py-0 px-2" />
                          </div>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Rate & Corridor Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" /> Exchange Rates
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => refetchRates()} className="h-8 w-8">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {isRatesLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">USD / INR</span>
                    <span className="font-money font-bold text-brand-600 dark:text-brand-400">
                      ₹ {rates.INR || '83.25'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">USD / EUR</span>
                    <span className="font-money font-bold text-brand-600 dark:text-brand-400">
                      € {rates.EUR || '0.92'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">USD / GBP</span>
                    <span className="font-money font-bold text-brand-600 dark:text-brand-400">
                      £ {rates.GBP || '0.78'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">USD / NGN</span>
                    <span className="font-money font-bold text-brand-600 dark:text-brand-400">
                      ₦ {rates.NGN || '1520.00'}
                    </span>
                  </div>
                  <div className="pt-2 text-center">
                    <NavLink to="/app/rates" className="text-xs font-semibold text-brand-500 hover:underline">
                      View All Live Exchange Rates →
                    </NavLink>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal open={addFundsOpen} onOpenChange={setAddFundsOpen} />
    </div>
  );
}

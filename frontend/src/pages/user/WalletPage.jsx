import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MoneyText } from '@/components/common/MoneyText';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/format';
import { Plus, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { AddFundsModal } from './components/AddFundsModal';

export function WalletPage() {
  const [page, setPage] = useState(1);
  const { wallet, balance, currency, isFrozen, ledger, ledgerPagination, isLoading, isLedgerLoading } =
    useWallet({ page, limit: 10 });

  const [addFundsOpen, setAddFundsOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Wallet & Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your wallet deposits, view transaction balance history and debits.
          </p>
        </div>

        <Button variant="primary" onClick={() => setAddFundsOpen(true)} disabled={isFrozen}>
          <Plus className="w-4 h-4" /> Add Funds
        </Button>
      </div>

      {/* Frozen Wallet Alert */}
      {isFrozen && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Your wallet is currently frozen by compliance. Outgoing transactions are suspended. Contact support.</span>
        </div>
      )}

      {/* Wallet Balance Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-r from-brand-600 to-teal-700 text-white border-none shadow-lg">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-brand-100">Active Balance</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                {currency}
              </span>
            </div>

            {isLoading ? (
              <Skeleton className="h-10 w-48 bg-white/20" />
            ) : (
              <MoneyText amount={balance} currency={currency} className="text-4xl font-extrabold text-white" />
            )}

            <div className="text-xs text-brand-100 flex items-center justify-between pt-2 border-t border-white/10">
              <span>Wallet Status: <span className="font-bold capitalize">{wallet?.status || 'Active'}</span></span>
              <span>Account ID: #{wallet?._id?.slice(-8) || wallet?.id?.slice(-8) || 'MAIN'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <WalletIcon className="w-5 h-5 text-brand-500" />
            <span>Quick Deposit</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instantly add funds via debit card or simulated wire transfer.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setAddFundsOpen(true)} disabled={isFrozen}>
            <Plus className="w-4 h-4 mr-1" /> Deposit Funds
          </Button>
        </Card>
      </div>

      {/* Ledger History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Ledger History</CardTitle>
          <CardDescription>Itemized list of credits, debits, and balance updates.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {isLedgerLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : ledger.length === 0 ? (
            <EmptyState
              title="No ledger entries"
              description="Your wallet history is currently empty. Deposit funds to get started."
              actionLabel="Deposit Funds"
              onAction={() => setAddFundsOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-6">Type</th>
                    <th className="py-3 px-6">Description</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Balance After</th>
                    <th className="py-3 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {ledger.map((item, idx) => {
                    const isCredit = item.type === 'credit' || item.amount > 0;
                    return (
                      <tr key={item._id || item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-6">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold capitalize ${
                              isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4 text-rose-500" />}
                            {item.type || (isCredit ? 'Credit' : 'Debit')}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-700 dark:text-slate-300">
                          {item.description || item.reason || 'Wallet Activity'}
                        </td>
                        <td className="py-3.5 px-6 font-money font-bold">
                          <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}>
                            {isCredit ? '+' : '-'}<MoneyText amount={Math.abs(item.amount)} currency={currency} />
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-money text-slate-600 dark:text-slate-400">
                          <MoneyText amount={item.balanceAfter} currency={currency} />
                        </td>
                        <td className="py-3.5 px-6 text-slate-500">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Pagination
              page={ledgerPagination.page}
              totalPages={ledgerPagination.totalPages}
              total={ledgerPagination.total}
              limit={ledgerPagination.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <AddFundsModal open={addFundsOpen} onOpenChange={setAddFundsOpen} />
    </div>
  );
}

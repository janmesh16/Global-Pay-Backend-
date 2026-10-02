import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTransfers } from '@/hooks/useTransfers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MoneyText } from '@/components/common/MoneyText';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';
import { Search, Download, ExternalLink, Filter, Send } from 'lucide-react';
import { toast } from 'sonner';

export function TransfersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { transfers, pagination, isLoading } = useTransfers({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const handleExportCSV = () => {
    if (!transfers.length) {
      toast.error('No transactions available to export.');
      return;
    }

    const headers = ['Reference', 'Recipient', 'Amount', 'Currency', 'Converted Amount', 'Target Currency', 'Fee', 'Status', 'Date'];
    const rows = transfers.map((t) => [
      t.reference || t._id || t.id,
      t.recipient?.name || t.recipientName || 'N/A',
      t.sourceAmount || t.amount,
      t.sourceCurrency || 'USD',
      t.targetAmount || t.convertedAmount || '-',
      t.targetCurrency || 'INR',
      t.fee || '0.00',
      t.status,
      t.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `globalpay_transfers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV export downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Transfer History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete records of all your international transfers and tracking status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <NavLink to="/app/send">
            <Button variant="primary" size="sm">
              <Send className="w-4 h-4" /> Send Money
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search reference number or recipient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-4">
            <Select value={statusFilter} onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="flagged">Flagged</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : transfers.length === 0 ? (
            <EmptyState
              title="No transfers found"
              description="No transaction records match your filters."
              actionLabel="Initiate Transfer"
              onAction={() => window.location.href = '/app/send'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-y border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Reference</th>
                    <th className="py-3.5 px-6">Recipient</th>
                    <th className="py-3.5 px-6">Send Amount</th>
                    <th className="py-3.5 px-6">Fee</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {transfers.map((t) => {
                    const id = t._id || t.id;
                    const recipientName = t.recipient?.name || t.recipientName || 'Recipient';

                    return (
                      <tr key={id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-slate-100">
                          #{t.reference || id.slice(-8)}
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{recipientName}</p>
                            <p className="text-[10px] text-slate-400">{t.targetCurrency || 'INR'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-money font-bold text-slate-900 dark:text-slate-100">
                          <MoneyText amount={t.sourceAmount || t.amount} currency={t.sourceCurrency || 'USD'} />
                        </td>
                        <td className="py-4 px-6 font-money text-slate-500">
                          <MoneyText amount={t.fee || '0.00'} currency={t.sourceCurrency || 'USD'} />
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {formatDate(t.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <NavLink to={`/app/transfers/${id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Details <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </NavLink>
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
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

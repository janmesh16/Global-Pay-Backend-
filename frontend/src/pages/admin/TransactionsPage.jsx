import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
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
import { Search, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'transactions', page, search, statusFilter],
    queryFn: async () => {
      try {
        const res = await adminApi.getTransactions({ page, limit: 10, search, status: statusFilter });
        return res;
      } catch (e) {
        return { items: [], page: 1, limit: 10, total: 0, totalPages: 1 };
      }
    },
  });

  const transactions = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const handleExportCSV = () => {
    if (!transactions.length) {
      toast.error('No transactions to export.');
      return;
    }
    const headers = ['Reference', 'Sender', 'Recipient', 'Amount', 'Currency', 'Status', 'Date'];
    const rows = transactions.map((t) => [
      t.reference || t._id || t.id,
      t.sender?.name || t.senderEmail || 'N/A',
      t.recipient?.name || t.recipientName || 'N/A',
      t.sourceAmount || t.amount,
      t.sourceCurrency || 'USD',
      t.status,
      t.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Admin transaction logs downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Global Transaction Logs
          </h1>
          <p className="text-xs text-slate-400">
            Monitor and audit all system-wide cross-border transactions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV} className="border-slate-800 text-slate-300">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-900 border-slate-800 p-4 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search reference or user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border-slate-800 text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="flagged">Flagged</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 bg-slate-800 w-full" />
              <Skeleton className="h-12 bg-slate-800 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState title="No transactions found" description="No transactions match your search criteria." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Reference</th>
                    <th className="py-3.5 px-6">Sender</th>
                    <th className="py-3.5 px-6">Recipient</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {transactions.map((t) => {
                    const id = t._id || t.id;
                    return (
                      <tr key={id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-white">
                          #{t.reference || id.slice(-8)}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {t.sender?.name || t.senderEmail || 'User'}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {t.recipient?.name || t.recipientName || 'Recipient'}
                        </td>
                        <td className="py-4 px-6 font-money font-bold text-white">
                          <MoneyText amount={t.sourceAmount || t.amount} currency={t.sourceCurrency || 'USD'} />
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {formatDate(t.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-slate-800">
            <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={setPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

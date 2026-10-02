import React, { useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useTransferDetail } from '@/hooks/useTransfers';
import { getSocket } from '@/lib/socket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MoneyText } from '@/components/common/MoneyText';
import { CountryFlag } from '@/components/common/CountryFlag';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { ArrowLeft, Copy, Check, ShieldAlert, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function TransferDetailPage() {
  const { id } = useParams();
  const { transfer, isLoading, refetch } = useTransferDetail(id);
  const [copied, setCopied] = React.useState(false);

  // Subscribe socket to specific transfer room
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !id) return;

    socket.emit('transfer:subscribe', { id });
    return () => {
      socket.emit('transfer:unsubscribe', { id });
    };
  }, [id]);

  const handleCopyRef = () => {
    const ref = transfer?.reference || id;
    navigator.clipboard.writeText(ref);
    setCopied(true);
    toast.success('Reference number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold">Transfer Not Found</h2>
        <NavLink to="/app/transfers">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1" /> Back to History</Button>
        </NavLink>
      </div>
    );
  }

  const status = (transfer.status || 'pending').toLowerCase();
  const history = transfer.statusHistory || [
    { status: 'pending', timestamp: transfer.createdAt },
    ...(status === 'completed' ? [{ status: 'completed', timestamp: transfer.updatedAt }] : []),
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NavLink to="/app/transfers">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </NavLink>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-slate-100">
                #{transfer.reference || id.slice(-8)}
              </h1>
              <Button variant="outline" size="sm" onClick={handleCopyRef} className="h-7 text-[11px] gap-1 px-2">
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy Ref
              </Button>
            </div>
            <p className="text-xs text-slate-400">Initiated on {formatDate(transfer.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={status} className="text-xs py-1 px-3" />
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Flagged Warning Banner if under review */}
      {status === 'flagged' && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-semibold flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Under Compliance Review</p>
            <p>This transfer was flagged for routine AML verification. Our compliance team is reviewing it. No action is required from you.</p>
          </div>
        </div>
      )}

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detail Summary Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle>Transfer Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Recipient Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {transfer.recipient?.name || transfer.recipientName || 'Recipient'}
                  {transfer.recipient?.country && <CountryFlag code={transfer.recipient.country} />}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Source Amount Sent:</span>
                <span className="font-money font-bold text-slate-900 dark:text-slate-100">
                  <MoneyText amount={transfer.sourceAmount || transfer.amount} currency={transfer.sourceCurrency || 'USD'} />
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Transfer Fee:</span>
                <span className="font-money font-semibold text-slate-700 dark:text-slate-300">
                  <MoneyText amount={transfer.fee || '0.00'} currency={transfer.sourceCurrency || 'USD'} />
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Locked Rate:</span>
                <span className="font-money font-semibold text-slate-700 dark:text-slate-300">
                  1 {transfer.sourceCurrency || 'USD'} = {transfer.exchangeRate || transfer.rate || '83.25'} {transfer.targetCurrency || 'INR'}
                </span>
              </div>

              <div className="flex justify-between py-2 font-bold text-sm text-brand-600 dark:text-brand-400">
                <span>Recipient Receives:</span>
                <span className="font-money">
                  <MoneyText amount={transfer.targetAmount || transfer.convertedAmount} currency={transfer.targetCurrency || 'INR'} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Timeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" /> Realtime Timeline
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 dark:border-slate-800">
                {history.map((h, index) => {
                  const stepStatus = h.status.toLowerCase();
                  const isLast = index === history.length - 1;

                  let Icon = Clock;
                  let colorClass = 'bg-amber-500 text-white';

                  if (stepStatus === 'completed') {
                    Icon = CheckCircle2;
                    colorClass = 'bg-emerald-500 text-white';
                  } else if (stepStatus === 'failed') {
                    Icon = XCircle;
                    colorClass = 'bg-rose-500 text-white';
                  } else if (stepStatus === 'flagged') {
                    Icon = ShieldAlert;
                    colorClass = 'bg-purple-600 text-white';
                  }

                  return (
                    <div key={index} className="relative">
                      <div className={`absolute -left-[31px] top-0 h-6 w-6 rounded-full ${colorClass} flex items-center justify-center shadow-md`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                          {h.status}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(h.timestamp || h.createdAt)}
                        </p>
                        {h.note && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{h.note}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complianceApi } from '@/api/compliance.api';
import { adminApi } from '@/api/admin.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MoneyText } from '@/components/common/MoneyText';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function CompliancePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'logs'
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  // Fetch flagged queue transactions
  const { data: queueData, isLoading: isQueueLoading } = useQuery({
    queryKey: ['compliance', 'queue'],
    queryFn: async () => {
      try {
        const res = await adminApi.getTransactions({ status: 'flagged' });
        return res?.items || [];
      } catch (e) {
        return [];
      }
    },
  });

  // Fetch compliance logs
  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ['compliance', 'logs'],
    queryFn: async () => {
      try {
        const res = await complianceApi.getComplianceLogs();
        return Array.isArray(res) ? res : res?.items || [];
      } catch (e) {
        return [];
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: complianceApi.verifyComplianceItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Compliance decision processed successfully.');
      setReviewItem(null);
      setReviewNote('');
    },
    onError: (err) => toast.error(err.message || 'Failed to process compliance decision.'),
  });

  const handleApprove = (item) => {
    verifyMutation.mutate({
      transactionId: item._id || item.id,
      status: 'approved',
      notes: reviewNote || 'Approved by compliance officer after verification.',
    });
  };

  const handleReject = (item) => {
    verifyMutation.mutate({
      transactionId: item._id || item.id,
      status: 'rejected',
      notes: reviewNote || 'Rejected due to AML policy non-compliance.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-purple-400" /> Compliance & AML Review Queue
        </h1>
        <p className="text-xs text-slate-400">
          Review transactions flagged by automated AML risk scoring algorithms.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'queue'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('queue')}
        >
          Review Queue ({queueData?.length || 0})
        </button>

        <button
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('logs')}
        >
          Compliance Logs
        </button>
      </div>

      {/* Queue View */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {isQueueLoading ? (
            <Skeleton className="h-32 bg-slate-900 w-full" />
          ) : queueData.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="Review queue is clear"
              description="There are currently no transactions flagged for compliance review."
            />
          ) : (
            <div className="space-y-4">
              {queueData.map((t) => {
                const id = t._id || t.id;
                const riskScore = t.riskScore || 85;

                return (
                  <Card key={id} className="bg-slate-900 border-purple-900/50 text-white">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-purple-300 text-sm">
                              Ref #{t.reference || id.slice(-8)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-800">
                              Risk Score: {riskScore} / 100
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Flagged on {formatDate(t.createdAt)}
                          </p>
                        </div>

                        <div className="text-right">
                          <MoneyText
                            amount={t.sourceAmount || t.amount}
                            currency={t.sourceCurrency || 'USD'}
                            className="text-lg font-bold text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <p className="text-slate-400 font-semibold uppercase text-[10px]">Sender Details</p>
                          <p className="font-bold text-white">{t.sender?.name || t.senderEmail || 'User'}</p>
                          <p className="text-slate-400">ID: #{t.sender?._id || t.senderId || 'SYS'}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <p className="text-slate-400 font-semibold uppercase text-[10px]">Triggered AML Reasons</p>
                          <p className="text-amber-400 font-semibold">
                            {t.flaggedReason || 'Transaction amount exceeds single transfer threshold ($10,000)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(t)}
                          isLoading={verifyMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject & Refund
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(t)}
                          isLoading={verifyMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve Transfer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Logs View */}
      {activeTab === 'logs' && (
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="px-0 pb-0">
            {isLogsLoading ? (
              <Skeleton className="h-40 bg-slate-800 w-full" />
            ) : logsData.length === 0 ? (
              <EmptyState title="No compliance logs" description="Compliance audit logs will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6">Transaction</th>
                      <th className="py-3.5 px-6">Action</th>
                      <th className="py-3.5 px-6">Officer Note</th>
                      <th className="py-3.5 px-6">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {logsData.map((log, i) => (
                      <tr key={log._id || i} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-6 font-mono font-bold text-purple-300">
                          #{log.transactionId?.slice(-8) || log.reference || 'REF'}
                        </td>
                        <td className="py-3.5 px-6">
                          <StatusBadge status={log.status || log.action} />
                        </td>
                        <td className="py-3.5 px-6 text-slate-300">{log.notes || log.reason || '-'}</td>
                        <td className="py-3.5 px-6 text-slate-400">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

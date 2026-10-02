import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MoneyText } from '@/components/common/MoneyText';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';
import { Search, User, ShieldCheck, ShieldAlert, Wallet, Lock, Unlock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected User for Wallet Adjustment Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState('credit');
  const [adjustAmount, setAdjustAmount] = useState('100.00');
  const [adjustReason, setAdjustReason] = useState('');

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, statusFilter],
    queryFn: async () => {
      try {
        const res = await adminApi.getUsers({ page, limit: 10, search, status: statusFilter });
        return res;
      } catch (e) {
        return { items: [], page: 1, limit: 10, total: 0, totalPages: 1 };
      }
    },
  });

  const users = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const userStatusMutation = useMutation({
    mutationFn: ({ id, statusData }) => adminApi.updateUserStatus(id, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated successfully.');
      setConfirmAction(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to update user.'),
  });

  const walletAdjustMutation = useMutation({
    mutationFn: ({ userId, payload }) => adminApi.updateWallet(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Wallet updated successfully.');
      setAdjustModalOpen(false);
      setSelectedUser(null);
      setAdjustReason('');
    },
    onError: (err) => toast.error(err.message || 'Failed to update wallet.'),
  });

  const handleOpenAdjustModal = (u) => {
    setSelectedUser(u);
    setAdjustType('credit');
    setAdjustAmount('100.00');
    setAdjustReason('');
    setAdjustModalOpen(true);
  };

  const handleWalletAdjustSubmit = (e) => {
    e.preventDefault();
    if (!adjustReason) {
      toast.error('Mandatory reason required for wallet adjustments.');
      return;
    }
    const num = parseFloat(adjustAmount);
    if (isNaN(num) || num <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    walletAdjustMutation.mutate({
      userId: selectedUser._id || selectedUser.id,
      payload: {
        type: adjustType,
        amount: num.toFixed(2),
        reason: adjustReason,
      },
    });
  };

  const handleFreezeToggle = (u) => {
    const userId = u._id || u.id;
    const isFrozen = u.wallet?.isFrozen || u.wallet?.status === 'frozen';
    const action = isFrozen ? 'unfreeze' : 'freeze';

    walletAdjustMutation.mutate({
      userId,
      payload: { type: action, reason: `Admin ${action} operation` },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          User & Wallet Management
        </h1>
        <p className="text-xs text-slate-400">
          Manage user accounts, KYC verification statuses, and perform manual wallet adjustments.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-900 border-slate-800 p-4 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="blocked">Blocked</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 bg-slate-800 w-full" />
              <Skeleton className="h-12 bg-slate-800 w-full" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState title="No users found" description="No user accounts match your search." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">User</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">KYC Status</th>
                    <th className="py-3.5 px-6">Wallet Balance</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {users.map((u) => {
                    const id = u._id || u.id;
                    const walletBal = u.wallet?.balance || '0.00';
                    const isFrozen = u.wallet?.isFrozen || u.wallet?.status === 'frozen';

                    return (
                      <tr key={id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-bold text-white text-sm">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] uppercase font-bold">
                            {u.role || 'User'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={u.kycStatus || 'unverified'} />
                        </td>
                        <td className="py-4 px-6 font-money font-bold text-emerald-400">
                          <MoneyText amount={walletBal} currency={u.wallet?.currency || 'USD'} />
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={u.status || 'active'} />
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-brand-400 hover:bg-brand-950"
                            onClick={() => handleOpenAdjustModal(u)}
                          >
                            <Wallet className="w-3.5 h-3.5 mr-1" /> Adjust Balance
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 text-xs ${isFrozen ? 'text-emerald-400' : 'text-amber-400'}`}
                            onClick={() => handleFreezeToggle(u)}
                          >
                            {isFrozen ? <Unlock className="w-3.5 h-3.5 mr-1" /> : <Lock className="w-3.5 h-3.5 mr-1" />}
                            {isFrozen ? 'Unfreeze' : 'Freeze'}
                          </Button>
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

      {/* Wallet Adjust Modal */}
      <Modal
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        title="Manual Wallet Adjustment"
        description={`Adjust wallet for ${selectedUser?.name} (${selectedUser?.email}).`}
      >
        <form onSubmit={handleWalletAdjustSubmit} className="space-y-4 pt-2 text-slate-900 dark:text-slate-100">
          <Select
            label="Adjustment Type"
            value={adjustType}
            onChange={(e) => setAdjustType(e.target.value)}
          >
            <option value="credit">Credit (Deposit Funds)</option>
            <option value="debit">Debit (Deduct Funds)</option>
          </Select>

          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="100.00"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
            required
          />

          <Input
            label="Mandatory Reason"
            placeholder="e.g. Compliance refund / Correction"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={walletAdjustMutation.isPending}>
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

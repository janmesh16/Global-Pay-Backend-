import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipientsApi } from '@/api/recipients.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CountryFlag } from '@/components/common/CountryFlag';
import { maskAccount } from '@/lib/format';
import { SUPPORTED_COUNTRIES, SUPPORTED_CURRENCIES } from '@/lib/constants';
import { Plus, Search, User, Trash2, Edit2, Building, Mail, Phone, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function RecipientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Recipient Form State
  const [formData, setFormData] = useState({
    name: '',
    country: 'IN',
    currency: 'INR',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    email: '',
    phone: '',
  });

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['recipients', search, countryFilter],
    queryFn: async () => {
      const data = await recipientsApi.getRecipients({ search, country: countryFilter });
      return Array.isArray(data) ? data : data.items || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: recipientsApi.createRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      toast.success('Recipient saved successfully!');
      setModalOpen(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message || 'Failed to save recipient.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => recipientsApi.updateRecipient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      toast.success('Recipient updated successfully!');
      setModalOpen(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message || 'Failed to update recipient.'),
  });

  const deleteMutation = useMutation({
    mutationFn: recipientsApi.deleteRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      toast.success('Recipient removed.');
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete recipient.'),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      country: 'IN',
      currency: 'INR',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      email: '',
      phone: '',
    });
    setEditingRecipient(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecipient(rec);
    setFormData({
      name: rec.name || '',
      country: rec.country || 'IN',
      currency: rec.currency || 'INR',
      bankName: rec.bankName || rec.bankDetails?.bankName || '',
      accountNumber: rec.accountNumber || rec.bankDetails?.accountNumber || '',
      routingNumber: rec.routingNumber || rec.bankDetails?.routingNumber || '',
      email: rec.email || '',
      phone: rec.phone || '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.accountNumber) {
      toast.error('Please enter name and account number.');
      return;
    }

    if (editingRecipient) {
      updateMutation.mutate({ id: editingRecipient._id || editingRecipient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filtered = recipients.filter((r) => {
    const matchesSearch =
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = !countryFilter || r.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Recipients & Bank Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Saved international recipients for fast cross-border transfers.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add New Recipient
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search recipients by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="sm:col-span-4">
            <Select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="">All Countries</option>
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Recipients List / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No recipients found"
          description="Create your first recipient to start sending money globally."
          actionLabel="Add Recipient"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((rec) => {
            const id = rec._id || rec.id;
            const bank = rec.bankName || rec.bankDetails?.bankName || 'Bank Account';
            const acc = rec.accountNumber || rec.bankDetails?.accountNumber;

            return (
              <Card key={id} className="hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-300 font-bold flex items-center justify-center">
                      {rec.name?.[0] || 'R'}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {rec.name} <CountryFlag code={rec.country} />
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        {bank}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account:</span>
                      <span className="font-money font-semibold text-slate-800 dark:text-slate-200">
                        {maskAccount(acc)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Currency:</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {rec.currency || 'USD'}
                      </span>
                    </div>
                  </div>

                  {rec.email && (
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {rec.email}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                      onClick={() => handleOpenEdit(rec)}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      onClick={() => setDeleteId(id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recipient Form Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
        description="Save recipient details for seamless international transfers."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          <Input
            label="Recipient Full Name"
            placeholder="Jane Smith"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Country"
              value={formData.country}
              onChange={(e) => {
                const countryObj = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
                setFormData({
                  ...formData,
                  country: e.target.value,
                  currency: countryObj?.currency || formData.currency,
                });
              }}
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Bank Name"
            placeholder="HDFC Bank / Barclays / Chase"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Account Number / IBAN"
              placeholder="9876543210"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              required
            />
            <Input
              label="Routing / IFSC Code"
              placeholder="HDFC0001234"
              value={formData.routingNumber}
              onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
            />
          </div>

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="recipient@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingRecipient ? 'Save Changes' : 'Create Recipient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Recipient?"
        description="Are you sure you want to remove this saved recipient?"
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

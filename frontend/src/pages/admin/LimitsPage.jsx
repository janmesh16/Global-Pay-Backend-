import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Sliders, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function LimitsPage() {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: limits, isLoading } = useQuery({
    queryKey: ['admin', 'limits'],
    queryFn: async () => {
      try {
        const res = await adminApi.getLimits();
        return res;
      } catch (e) {
        return {
          feePercent: '0.5',
          flatFee: '1.00',
          minTransferAmount: '10.00',
          maxTransferAmount: '10000.00',
          dailyLimit: '25000.00',
          monthlyLimit: '100000.00',
          unverifiedKycCap: '1000.00',
          amlThreshold: '10000.00',
        };
      }
    },
  });

  const [formValues, setFormValues] = useState({
    feePercent: '0.5',
    flatFee: '1.00',
    minTransferAmount: '10.00',
    maxTransferAmount: '10000.00',
    dailyLimit: '25000.00',
    monthlyLimit: '100000.00',
    unverifiedKycCap: '1000.00',
    amlThreshold: '10000.00',
  });

  React.useEffect(() => {
    if (limits) {
      setFormValues({
        feePercent: limits.feePercent || '0.5',
        flatFee: limits.flatFee || '1.00',
        minTransferAmount: limits.minTransferAmount || '10.00',
        maxTransferAmount: limits.maxTransferAmount || '10000.00',
        dailyLimit: limits.dailyLimit || '25000.00',
        monthlyLimit: limits.monthlyLimit || '100000.00',
        unverifiedKycCap: limits.unverifiedKycCap || '1000.00',
        amlThreshold: limits.amlThreshold || '10000.00',
      });
    }
  }, [limits]);

  const updateLimitsMutation = useMutation({
    mutationFn: adminApi.updateLimits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'limits'] });
      toast.success('System fees and limits updated!');
      setConfirmOpen(false);
    },
    onError: (err) => toast.error(err.message || 'Failed to update settings.'),
  });

  const handleSaveClick = (e) => {
    e.preventDefault();
    // Validate min < max
    if (parseFloat(formValues.minTransferAmount) >= parseFloat(formValues.maxTransferAmount)) {
      toast.error('Min transfer amount must be less than max transfer amount.');
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-brand-400" /> Fees & Transfer Limits Configuration
        </h1>
        <p className="text-xs text-slate-400">
          Configure transaction fee percentages, minimum/maximum transfer caps, and AML threshold triggers.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Fee Structure & Threshold Rules</CardTitle>
          <CardDescription className="text-slate-400">
            Changes apply immediately to all upcoming transfer previews and submissions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveClick} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Transfer Fee Percentage (%)"
                type="number"
                step="0.01"
                value={formValues.feePercent}
                onChange={(e) => setFormValues({ ...formValues, feePercent: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <Input
                label="Flat Fee Amount ($)"
                type="number"
                step="0.01"
                value={formValues.flatFee}
                onChange={(e) => setFormValues({ ...formValues, flatFee: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <Input
                label="Minimum Transfer Amount ($)"
                type="number"
                step="0.01"
                value={formValues.minTransferAmount}
                onChange={(e) => setFormValues({ ...formValues, minTransferAmount: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <Input
                label="Maximum Transfer Amount ($)"
                type="number"
                step="0.01"
                value={formValues.maxTransferAmount}
                onChange={(e) => setFormValues({ ...formValues, maxTransferAmount: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <Input
                label="Daily User Transfer Limit ($)"
                type="number"
                step="0.01"
                value={formValues.dailyLimit}
                onChange={(e) => setFormValues({ ...formValues, dailyLimit: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <Input
                label="Unverified KYC Max Cap ($)"
                type="number"
                step="0.01"
                value={formValues.unverifiedKycCap}
                onChange={(e) => setFormValues({ ...formValues, unverifiedKycCap: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />

              <Input
                label="AML Automated Flagging Threshold ($)"
                type="number"
                step="0.01"
                value={formValues.amlThreshold}
                onChange={(e) => setFormValues({ ...formValues, amlThreshold: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
                helperText="Transfers exceeding this amount will automatically trigger AML compliance review."
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button type="submit" variant="primary" className="bg-brand-500 hover:bg-brand-600">
                <Save className="w-4 h-4 mr-2" /> Save System Limits
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Save System Settings?"
        description="Are you sure you want to update global fee and limit rules?"
        confirmLabel="Apply Settings"
        variant="primary"
        isLoading={updateLimitsMutation.isPending}
        onConfirm={() => updateLimitsMutation.mutate(formValues)}
      />
    </div>
  );
}

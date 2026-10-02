import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { complianceApi } from '@/api/compliance.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ShieldCheck, FileCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function KycPage() {
  const { user, updateUser } = useAuth();
  const kycStatus = user?.kycStatus || 'unverified';

  const [documentType, setDocumentType] = useState('passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitKyc = async (e) => {
    e.preventDefault();
    if (!documentNumber) {
      toast.error('Please enter document number.');
      return;
    }
    setIsSubmitting(true);

    try {
      await complianceApi.submitKyc({
        documentType,
        documentNumber,
      });
      updateUser({ kycStatus: 'pending' });
      toast.success('KYC document submitted for verification!');
    } catch (err) {
      toast.error(err.message || 'KYC submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          KYC Identity Verification
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Verify your identity to unlock higher daily transfer limits and global compliance approval.
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-xl shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Account Verification Status
                </h3>
                <StatusBadge status={kycStatus} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {kycStatus === 'verified'
                  ? 'Your identity is fully verified. Enjoy unlimited transfer privileges.'
                  : kycStatus === 'pending'
                  ? 'Your submitted document is under review by our compliance team.'
                  : 'Complete verification below to expand your daily transfer threshold.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      {kycStatus !== 'verified' && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Verification Documents</CardTitle>
            <CardDescription>Simulated KYC document submission for instant automated or admin verification.</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmitKyc} className="space-y-4">
              <Select
                label="Document Type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                disabled={kycStatus === 'pending'}
              >
                <option value="passport">Passport</option>
                <option value="national_id">National Identity Card</option>
                <option value="drivers_license">Driver's License</option>
              </Select>

              <Input
                label="Document Reference Number"
                placeholder="A12345678"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                disabled={kycStatus === 'pending'}
                required
              />

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Documents are encrypted and processed securely per regulatory standards.</span>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={kycStatus === 'pending'}
                >
                  {kycStatus === 'pending' ? 'Verification Pending' : 'Submit for Verification'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

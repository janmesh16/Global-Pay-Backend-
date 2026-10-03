import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recipientsApi } from '@/api/recipients.api';
import { useWallet } from '@/hooks/useWallet';
import { useRates, useConvertPreview } from '@/hooks/useRates';
import { useTransfers } from '@/hooks/useTransfers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MoneyText } from '@/components/common/MoneyText';
import { CountryFlag } from '@/components/common/CountryFlag';
import { formatDate } from '@/lib/format';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';
import { Send, CheckCircle2, User, AlertCircle, ArrowRight, ShieldCheck, Lock, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function SendMoneyWizardPage() {
  const navigate = useNavigate();
  const { balance, currency: walletCurrency } = useWallet();
  const { createTransfer, isCreating } = useTransfers();

  // Wizard Step: 1 = Recipient, 2 = Amount & Fees, 3 = Review & Lock, 4 = Result
  const [step, setStep] = useState(1);

  // Form State
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [amount, setAmount] = useState('200.00');
  const [note, setNote] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(`idemp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
  const [completedTransfer, setCompletedTransfer] = useState(null);
  const [serverError, setServerError] = useState('');

  // Recipients query
  const { data: recipients = [], isLoading: isRecipientsLoading } = useQuery({
    queryKey: ['recipients'],
    queryFn: async () => {
      const res = await recipientsApi.getRecipients();
      return Array.isArray(res) ? res : res?.data || res?.items || [];
    },
  });

  const sourceCurrency = walletCurrency || 'USD';
  const targetCurrency = selectedRecipient?.currency || 'INR';

  // Rate & Fee Preview query
  const { preview, isLoading: isPreviewLoading } = useConvertPreview({
    from: sourceCurrency,
    to: targetCurrency,
    amount,
  });

  const numAmount = parseFloat(amount || '0');
  const fee = preview?.fee ? parseFloat(preview.fee) : numAmount * 0.005;
  const totalDebit = preview?.totalDebit ? parseFloat(preview.totalDebit) : numAmount + fee;
  const recipientGets = preview?.convertedAmount || (numAmount * (parseFloat(preview?.rate || '83.2') || 1)).toFixed(2);
  const hasEnoughBalance = parseFloat(balance || '0') >= totalDebit;

  const handleSelectRecipient = (rec) => {
    setSelectedRecipient(rec);
  };

  const handleNextStep1 = () => {
    if (!selectedRecipient) {
      toast.error('Please select a recipient.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (!hasEnoughBalance) {
      toast.error('Insufficient wallet balance to cover transfer and fee.');
      return;
    }
    setServerError('');
    setStep(3);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedRecipient) return;
    setServerError('');

    const payload = {
      recipientId: selectedRecipient._id || selectedRecipient.id,
      sourceAmount: numAmount.toFixed(2),
      sourceCurrency,
      targetCurrency,
      note,
    };

    try {
      const res = await createTransfer({ transferData: payload, idempotencyKey });
      const transferObj = res.transfer || res.data || res;
      setCompletedTransfer(transferObj);
      setStep(4);
    } catch (err) {
      const errMsg = err.message || 'Transfer failed.';
      setServerError(errMsg);
      if (err.status === 422 || err.status === 400) {
        toast.error(errMsg);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Send Money Online
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Fast, transparent cross-border money transfers with live status tracking.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {[
          { num: 1, label: 'Recipient' },
          { num: 2, label: 'Amount & Rates' },
          { num: 3, label: 'Review & Confirm' },
          { num: 4, label: 'Status' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              step === s.num
                ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                : step > s.num
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                : 'bg-white dark:bg-navy-900 text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
              {step > s.num ? '✓' : s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Select Recipient */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Choose Recipient</CardTitle>
            <CardDescription>Select an existing saved recipient or add a new one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRecipientsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recipients.length === 0 ? (
              <div className="p-6 text-center space-y-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-500">No recipients saved yet.</p>
                <NavLink to="/app/recipients">
                  <Button size="sm">Add First Recipient</Button>
                </NavLink>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipients.map((rec) => {
                  const id = rec._id || rec.id;
                  const isSelected = (selectedRecipient?._id || selectedRecipient?.id) === id;

                  return (
                    <div
                      key={id}
                      onClick={() => handleSelectRecipient(rec)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-50/70 dark:bg-brand-950/60 border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                          : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center">
                            {rec.name?.[0] || 'R'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {rec.name} <CountryFlag code={rec.country} />
                            </p>
                            <p className="text-[11px] text-slate-400">{rec.bankName || 'Bank Account'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-500">{rec.currency}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <NavLink to="/app/recipients">
              <Button variant="outline" size="sm">
                + Add Recipient
              </Button>
            </NavLink>
            <Button variant="primary" size="sm" onClick={handleNextStep1} disabled={!selectedRecipient}>
              Continue to Amount <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Amount & Rates */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Enter Amount & Convert</CardTitle>
            <CardDescription>
              Sending to <span className="font-bold text-slate-900 dark:text-slate-100">{selectedRecipient?.name}</span> ({selectedRecipient?.currency})
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={`You Send (${sourceCurrency})`}
                type="number"
                step="0.01"
                placeholder="200.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Recipient Gets ({targetCurrency})
                </label>
                <div className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm font-money font-bold text-brand-600 dark:text-brand-400 flex items-center">
                  <MoneyText amount={recipientGets} currency={targetCurrency} />
                </div>
              </div>
            </div>

            {/* Wallet Balance & Limits Check */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Available Wallet Balance:</span>
                <span className="font-money font-semibold text-slate-800 dark:text-slate-200">
                  <MoneyText amount={balance} currency={sourceCurrency} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Itemized Fee (0.5%):</span>
                <span className="font-money font-semibold text-slate-800 dark:text-slate-200">
                  <MoneyText amount={fee.toFixed(2)} currency={sourceCurrency} />
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
                <span className="text-slate-900 dark:text-slate-100">Total Wallet Debit:</span>
                <span className={`font-money ${hasEnoughBalance ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500'}`}>
                  <MoneyText amount={totalDebit.toFixed(2)} currency={sourceCurrency} />
                </span>
              </div>
            </div>

            {!hasEnoughBalance && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Insufficient balance. Please deposit funds to your wallet first.</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="primary" size="sm" onClick={handleNextStep2} disabled={!hasEnoughBalance}>
              Review Transfer <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-500" /> Step 3: Review & Lock Rate
            </CardTitle>
            <CardDescription>
              Please verify transfer details. Your rate is locked on confirmation.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {serverError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Transaction Error</p>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Recipient Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedRecipient?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Bank & Account:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedRecipient?.bankName || 'Bank'} (****{selectedRecipient?.accountNumber?.slice(-4)})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Send Amount:</span>
                <span className="font-money font-bold text-slate-900 dark:text-slate-100">
                  <MoneyText amount={amount} currency={sourceCurrency} />
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">Fee (0.5%):</span>
                <span className="font-money font-semibold text-slate-800 dark:text-slate-200">
                  <MoneyText amount={fee.toFixed(2)} currency={sourceCurrency} />
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-sm text-brand-600 dark:text-brand-400">
                <span>Recipient Receives:</span>
                <span className="font-money">
                  <MoneyText amount={recipientGets} currency={targetCurrency} />
                </span>
              </div>
            </div>

            <Input
              label="Transfer Note (Optional)"
              placeholder="e.g. Family support / Tuition payment"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </CardContent>

          <CardFooter className="justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button variant="outline" size="sm" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirmTransfer}
              isLoading={isCreating}
            >
              <Send className="w-4 h-4 mr-1" /> Lock Rate & Send Now
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Result Step */}
      {step === 4 && completedTransfer && (
        <Card className="text-center p-8 space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Transfer Submitted!
            </h2>
            <p className="text-xs text-slate-500">
              Reference: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">#{completedTransfer.reference || completedTransfer._id || completedTransfer.id}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Status:</span>
              <StatusBadge status={completedTransfer.status || 'pending'} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Sent:</span>
              <MoneyText amount={completedTransfer.sourceAmount || amount} currency={sourceCurrency} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <NavLink to={`/app/transfers/${completedTransfer._id || completedTransfer.id}`}>
              <Button variant="primary">View Live Tracking Timeline</Button>
            </NavLink>
            <Button variant="outline" onClick={() => {
              setStep(1);
              setSelectedRecipient(null);
              setAmount('200.00');
              setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`);
            }}>
              Send Another Transfer
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useWallet } from '@/hooks/useWallet';
import { DollarSign, ShieldCheck } from 'lucide-react';

export function AddFundsModal({ open, onOpenChange }) {
  const { addFunds, isAddingFunds, currency } = useWallet();
  const [amount, setAmount] = useState('100.00');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid deposit amount greater than 0.');
      return;
    }
    setError('');

    try {
      await addFunds({
        amount: num.toFixed(2),
        currency: currency || 'USD',
        paymentMethod,
      });
      onOpenChange(false);
      setAmount('100.00');
    } catch (err) {
      setError(err.message || 'Failed to deposit funds.');
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Funds to Wallet"
      description="Simulate instant funding of your GlobalPay multi-currency wallet."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Deposit Amount"
          type="number"
          step="0.01"
          placeholder="100.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={error}
        />

        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="card">Debit / Credit Card (Simulated)</option>
          <option value="bank">Bank Transfer (Instant ACH)</option>
          <option value="wire">Wire Transfer</option>
        </Select>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Funds will be credited to your wallet balance instantly.</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isAddingFunds}>
            Confirm Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
}

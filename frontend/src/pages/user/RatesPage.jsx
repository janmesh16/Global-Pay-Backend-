import React, { useState } from 'react';
import { useRates, useConvertPreview } from '@/hooks/useRates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { MoneyText } from '@/components/common/MoneyText';
import { CountryFlag } from '@/components/common/CountryFlag';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { RefreshCw, ArrowRightLeft, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export function RatesPage() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('500');

  const { rates, source, timestamp, isLoading: isRatesLoading, refetch } = useRates(fromCurrency);
  const { preview, isLoading: isPreviewLoading } = useConvertPreview({
    from: fromCurrency,
    to: toCurrency,
    amount,
  });

  const popularCorridors = [
    { from: 'USD', to: 'INR', name: 'US to India' },
    { from: 'EUR', to: 'USD', name: 'Europe to US' },
    { from: 'GBP', to: 'EUR', name: 'UK to Europe' },
    { from: 'USD', to: 'NGN', name: 'US to Nigeria' },
    { from: 'CAD', to: 'INR', name: 'Canada to India' },
    { from: 'AUD', to: 'PHP', name: 'Australia to Philippines' },
  ];

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const currentRate = rates[toCurrency] || (preview?.rate ? String(preview.rate) : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Rates & Currency Converter
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time exchange rate updates with zero hidden markups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={source === 'live' ? 'success' : 'warning'} icon={<Zap className="w-3 h-3" />}>
            Source: {source || 'Cached'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isRatesLoading}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Main Converter Card */}
      <Card className="bg-white dark:bg-navy-900 shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" /> Currency Calculator & Fee Preview
          </CardTitle>
          <CardDescription>
            Rates updated continuously via European Central Bank (ECB) feed.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Amount & From */}
            <div className="md:col-span-5 space-y-2">
              <Input
                label="You Send"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex items-center justify-center pt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwap}
                title="Swap Currencies"
                className="rounded-full h-10 w-10 border-slate-300 dark:border-slate-700"
              >
                <ArrowRightLeft className="w-4 h-4 text-brand-500" />
              </Button>
            </div>

            {/* Target Currency */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Recipient Gets (Estimated)
              </label>
              <div className="flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-sm font-money font-bold text-brand-600 dark:text-brand-400 items-center">
                {isPreviewLoading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  <MoneyText amount={preview?.convertedAmount || (parseFloat(amount) * (parseFloat(currentRate) || 1)).toFixed(2)} currency={toCurrency} />
                )}
              </div>
              <Select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Detailed Fee & Rate Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Locked Exchange Rate:</span>
              <span className="font-money font-bold text-slate-900 dark:text-slate-100">
                1 {fromCurrency} = {currentRate || '...'} {toCurrency}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Transfer Fee (0.5%):</span>
              <span className="font-money font-semibold text-slate-800 dark:text-slate-200">
                <MoneyText amount={preview?.fee || (parseFloat(amount) * 0.005).toFixed(2)} currency={fromCurrency} />
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
              <span className="text-slate-800 dark:text-slate-200">Total Debit Amount:</span>
              <span className="font-money text-brand-600 dark:text-brand-400 text-sm">
                <MoneyText amount={preview?.totalDebit || (parseFloat(amount) + parseFloat(amount) * 0.005).toFixed(2)} currency={fromCurrency} />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Corridors Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Popular Corridors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularCorridors.map((corridor, i) => (
            <Card
              key={i}
              className="p-4 hover:border-brand-500 cursor-pointer transition-all duration-200"
              onClick={() => {
                setFromCurrency(corridor.from);
                setToCurrency(corridor.to);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CountryFlag code={corridor.from} />
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {corridor.from} → {corridor.to}
                  </span>
                  <CountryFlag code={corridor.to} />
                </div>
                <span className="text-xs font-semibold text-brand-500 hover:underline">Select</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{corridor.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

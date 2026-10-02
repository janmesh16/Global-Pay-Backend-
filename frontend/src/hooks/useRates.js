import { useQuery } from '@tanstack/react-query';
import { currencyApi } from '@/api/currency.api';
import { useDebounce } from './useDebounce';

export function useRates(fromCurrency = 'USD', toCurrency = '') {
  const ratesQuery = useQuery({
    queryKey: ['rates', fromCurrency, toCurrency],
    queryFn: async () => {
      const data = await currencyApi.getRates(fromCurrency, toCurrency);
      return data;
    },
    staleTime: 1000 * 60, // 60s stale time as requested
    refetchInterval: 1000 * 60,
  });

  return {
    rates: ratesQuery.data?.rates || {},
    baseCurrency: ratesQuery.data?.base || fromCurrency,
    source: ratesQuery.data?.source || 'cached',
    timestamp: ratesQuery.data?.timestamp,
    isLoading: ratesQuery.isLoading,
    isError: ratesQuery.isError,
    refetch: ratesQuery.refetch,
  };
}

export function useConvertPreview({ from, to, amount }) {
  const debouncedAmount = useDebounce(amount, 400);

  const previewQuery = useQuery({
    queryKey: ['convertPreview', from, to, debouncedAmount],
    queryFn: async () => {
      if (!from || !to || !debouncedAmount || parseFloat(debouncedAmount) <= 0) {
        return null;
      }
      const data = await currencyApi.convertPreview({
        from,
        to,
        amount: debouncedAmount,
      });
      return data;
    },
    enabled: Boolean(from && to && debouncedAmount && parseFloat(debouncedAmount) > 0),
    staleTime: 1000 * 30,
  });

  return {
    preview: previewQuery.data,
    isLoading: previewQuery.isLoading,
    isError: previewQuery.isError,
    error: previewQuery.error,
  };
}

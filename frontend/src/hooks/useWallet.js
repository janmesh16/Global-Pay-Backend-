import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet.api';
import { toast } from 'sonner';
import { normalizePagination } from '@/api/normalize';

export function useWallet(ledgerParams = {}) {
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
    staleTime: 1000 * 30,
  });

  const ledgerQuery = useQuery({
    queryKey: ['ledger', ledgerParams],
    queryFn: async () => {
      const data = await walletApi.getLedger(ledgerParams);
      return normalizePagination(data);
    },
    staleTime: 1000 * 15,
  });

  const addFundsMutation = useMutation({
    mutationFn: walletApi.addFunds,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      toast.success(data.message || 'Funds added successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add funds.');
    },
  });

  return {
    wallet: walletQuery.data,
    balance: walletQuery.data?.balance || '0.00',
    currency: walletQuery.data?.currency || 'USD',
    isFrozen: walletQuery.data?.isFrozen || walletQuery.data?.status === 'frozen',
    isLoading: walletQuery.isLoading,
    isError: walletQuery.isError,

    ledger: ledgerQuery.data?.items || [],
    ledgerPagination: {
      page: ledgerQuery.data?.page || 1,
      limit: ledgerQuery.data?.limit || 10,
      total: ledgerQuery.data?.total || 0,
      totalPages: ledgerQuery.data?.totalPages || 1,
    },
    isLedgerLoading: ledgerQuery.isLoading,

    addFunds: addFundsMutation.mutateAsync,
    isAddingFunds: addFundsMutation.isPending,
  };
}

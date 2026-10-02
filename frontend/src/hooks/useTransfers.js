import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transfersApi } from '@/api/transfers.api';
import { normalizePagination } from '@/api/normalize';
import { toast } from 'sonner';

export function useTransfers(params = {}) {
  const queryClient = useQueryClient();

  const transfersQuery = useQuery({
    queryKey: ['transfers', params],
    queryFn: async () => {
      const data = await transfersApi.getTransfers(params);
      return normalizePagination(data);
    },
    staleTime: 1000 * 15,
  });

  const createTransferMutation = useMutation({
    mutationFn: ({ transferData, idempotencyKey }) =>
      transfersApi.createTransfer(transferData, idempotencyKey),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      toast.success(data.message || 'Transfer initiated successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to process transfer.');
    },
  });

  return {
    transfers: transfersQuery.data?.items || [],
    pagination: {
      page: transfersQuery.data?.page || 1,
      limit: transfersQuery.data?.limit || 10,
      total: transfersQuery.data?.total || 0,
      totalPages: transfersQuery.data?.totalPages || 1,
    },
    isLoading: transfersQuery.isLoading,
    isError: transfersQuery.isError,
    refetch: transfersQuery.refetch,

    createTransfer: createTransferMutation.mutateAsync,
    isCreating: createTransferMutation.isPending,
  };
}

export function useTransferDetail(id) {
  const transferQuery = useQuery({
    queryKey: ['transfer', id],
    queryFn: async () => {
      if (!id) return null;
      return transfersApi.getTransferById(id);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 10,
  });

  return {
    transfer: transferQuery.data,
    isLoading: transferQuery.isLoading,
    isError: transferQuery.isError,
    refetch: transferQuery.refetch,
  };
}

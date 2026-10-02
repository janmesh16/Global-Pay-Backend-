import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { toast } from 'sonner';

export function useSocketEvents() {
  const queryClient = useQueryClient();
  const { updateUser, user } = useAuthStore();
  const { addNotification } = useNotificationsStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onTransferCreated = (data) => {
      console.log('[Socket] transfer:created', data);
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.info(`Transfer initiated: Ref #${data.reference || data._id}`);
      addNotification({
        title: 'Transfer Initiated',
        message: `Transfer #${data.reference || data.id} was created.`,
        type: 'info',
        link: `/app/transfers/${data._id || data.id}`,
      });
    };

    const onTransferStatus = (data) => {
      console.log('[Socket] transfer:status', data);
      const transferId = data.id || data._id;
      const ref = data.reference || transferId;
      const status = data.status;

      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer', transferId] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });

      if (status === 'completed') {
        toast.success(`Transfer ${ref} completed successfully!`);
        addNotification({
          title: 'Transfer Completed',
          message: `Your transfer ${ref} has been processed successfully.`,
          type: 'success',
          link: `/app/transfers/${transferId}`,
        });
      } else if (status === 'failed') {
        toast.error(`Transfer ${ref} failed.`);
        addNotification({
          title: 'Transfer Failed',
          message: `Transfer ${ref} failed: ${data.reason || 'Processing issue'}`,
          type: 'error',
          link: `/app/transfers/${transferId}`,
        });
      } else if (status === 'flagged') {
        toast.warning(`Transfer ${ref} is under compliance review.`);
        addNotification({
          title: 'Transfer Under Review',
          message: `Transfer ${ref} was flagged for review.`,
          type: 'warning',
          link: `/app/transfers/${transferId}`,
        });
      }
    };

    const onTransferFlagged = (data) => {
      console.log('[Socket] transfer:flagged (admin)', data);
      if (user?.role === 'admin') {
        queryClient.invalidateQueries({ queryKey: ['compliance'] });
        queryClient.invalidateQueries({ queryKey: ['admin'] });
        toast.warning(`Compliance Alert: New flagged transfer #${data.reference || data.id}`);
        addNotification({
          title: 'Flagged Transaction Alert',
          message: `New transaction #${data.reference || data.id} requires review.`,
          type: 'warning',
          link: `/admin/compliance`,
        });
      }
    };

    const onWalletUpdated = (data) => {
      console.log('[Socket] wallet:updated', data);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      if (data.newBalance !== undefined) {
        toast.info(`Wallet balance updated: ${data.currency || 'USD'} ${data.newBalance}`);
      }
    };

    const onKycUpdated = (data) => {
      console.log('[Socket] kyc:updated', data);
      updateUser({ kycStatus: data.status });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success(`KYC status updated: ${data.status.toUpperCase()}`);
      addNotification({
        title: 'KYC Verification Update',
        message: `Your account KYC status is now ${data.status}.`,
        type: data.status === 'verified' ? 'success' : 'warning',
        link: `/app/kyc`,
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('transfer:created', onTransferCreated);
    socket.on('transfer:status', onTransferStatus);
    socket.on('transfer:flagged', onTransferFlagged);
    socket.on('wallet:updated', onWalletUpdated);
    socket.on('kyc:updated', onKycUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('transfer:created', onTransferCreated);
      socket.off('transfer:status', onTransferStatus);
      socket.off('transfer:flagged', onTransferFlagged);
      socket.off('wallet:updated', onWalletUpdated);
      socket.off('kyc:updated', onKycUpdated);
    };
  }, [queryClient, updateUser, user]);

  return { isConnected };
}

import { useEffect, useState } from 'react';
import { requestFcmToken, onForegroundMessage } from '@/lib/firebase';
import { authApi } from '@/api/auth.api';
import { useNotificationsStore } from '@/store/notifications.store';
import { toast } from 'sonner';

export function useFcm(enabled = true) {
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');
  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const enableNotifications = async () => {
    try {
      const token = await requestFcmToken();
      if (token) {
        setFcmToken(token);
        setPermission(Notification.permission);
        await authApi.registerFcmToken(token);
        toast.success('Push notifications enabled!');
        return true;
      }
    } catch (e) {
      console.warn('[FCM] Error enabling push notifications:', e);
      toast.error('Failed to enable push notifications.');
    }
    return false;
  };

  useEffect(() => {
    if (!enabled) return;

    let unsubscribe = () => {};
    onForegroundMessage((payload) => {
      console.log('[FCM] Foreground notification received:', payload);
      const title = payload?.notification?.title || 'Notification';
      const body = payload?.notification?.body || '';
      toast.info(`${title}: ${body}`);
      addNotification({
        title,
        message: body,
        type: 'info',
      });
    }).then((unsub) => {
      if (typeof unsub === 'function') unsubscribe = unsub;
    });

    return () => {
      unsubscribe();
    };
  }, [enabled]);

  return {
    fcmToken,
    permission,
    enableNotifications,
  };
}

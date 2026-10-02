import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationsStore = create(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (item) => {
        const newNotif = {
          id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title: item.title,
          message: item.message,
          type: item.type || 'info', // info, success, warning, error
          link: item.link || null,
          read: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updated = [newNotif, ...state.notifications].slice(0, 50); // limit 50
          return {
            notifications: updated,
            unreadCount: state.unreadCount + 1,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          let foundUnread = false;
          const updated = state.notifications.map((n) => {
            if (n.id === id && !n.read) {
              foundUnread = true;
              return { ...n, read: true };
            }
            return n;
          });

          return {
            notifications: updated,
            unreadCount: Math.max(0, state.unreadCount - (foundUnread ? 1 : 0)),
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },
    }),
    {
      name: 'globalpay_notifications_inbox',
    }
  )
);

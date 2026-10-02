import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { disconnectSocket } from '@/lib/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: localStorage.getItem('token') || null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setSession: (user, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({
          user,
          token: token || get().token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (partialUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : partialUser,
        }));
      },

      logout: () => {
        localStorage.removeItem('token');
        disconnectSocket();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'globalpay_auth_session',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

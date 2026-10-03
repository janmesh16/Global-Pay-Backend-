import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { normalizeError, normalizeResponse } from './normalize';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap data envelope & handle global status codes
apiClient.interceptors.response.use(
  (response) => {
    return normalizeResponse(response);
  },
  (error) => {
    const normalized = normalizeError(error);

    if (normalized.status === 401) {
      const auth = useAuthStore.getState();
      auth.logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    } else if (normalized.status === 403) {
      toast.error(normalized.message || 'Access forbidden.');
    } else if (normalized.status === 429) {
      toast.error('Too many requests. Please try again shortly.');
    }

    return Promise.reject(normalized);
  }
);

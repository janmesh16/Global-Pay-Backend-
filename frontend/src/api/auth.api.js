import { apiClient } from './client';

export const authApi = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  firebaseAuth: async (idToken) => {
    return apiClient.post('/auth/firebase', { idToken });
  },

  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  registerFcmToken: async (fcmToken) => {
    return apiClient.post('/auth/fcm-token', { fcmToken });
  },

  removeFcmToken: async (fcmToken) => {
    return apiClient.delete('/auth/fcm-token', { data: { fcmToken } });
  },
};

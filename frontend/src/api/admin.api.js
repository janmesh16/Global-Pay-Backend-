import { apiClient } from './client';

export const adminApi = {
  getMetrics: async () => {
    return apiClient.get('/admin/metrics');
  },

  getUsers: async (params = {}) => {
    return apiClient.get('/admin/users', { params });
  },

  getUserById: async (id) => {
    return apiClient.get(`/admin/users/${id}`);
  },

  updateUserStatus: async (id, statusData) => {
    // statusData: { status: 'active' | 'suspended' | 'blocked' } or { role }
    return apiClient.put(`/admin/users/${id}`, statusData);
  },

  updateWallet: async (userId, data) => {
    // data: { amount, type: 'credit' | 'debit' | 'freeze' | 'unfreeze', reason }
    return apiClient.put(`/admin/wallets/${userId}`, data);
  },

  getTransactions: async (params = {}) => {
    return apiClient.get('/admin/transactions', { params });
  },

  getLimits: async () => {
    return apiClient.get('/admin/limits');
  },

  updateLimits: async (data) => {
    return apiClient.put('/admin/limits', data);
  },

  getReports: async (params = {}) => {
    return apiClient.get('/admin/reports', { params });
  },
};

import { apiClient } from './client';

export const walletApi = {
  getWallet: async () => {
    return apiClient.get('/wallet');
  },

  getBalance: async () => {
    return apiClient.get('/wallet/balance');
  },

  addFunds: async (payload) => {
    // payload: { amount, paymentMethod, currency }
    return apiClient.post('/wallet/add-funds', payload);
  },

  getLedger: async (params = {}) => {
    return apiClient.get('/wallet/ledger', { params });
  },
};

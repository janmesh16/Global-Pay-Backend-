import { apiClient } from './client';

export const transfersApi = {
  createTransfer: async (data, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return apiClient.post('/transfers', data, { headers });
  },

  getTransfers: async (params = {}) => {
    return apiClient.get('/transfers', { params });
  },

  getTransferById: async (id) => {
    return apiClient.get(`/transfers/${id}`);
  },

  getTransferStatus: async (id) => {
    return apiClient.get(`/transfers/status/${id}`);
  },
};

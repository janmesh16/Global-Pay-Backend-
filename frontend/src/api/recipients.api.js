import { apiClient } from './client';

export const recipientsApi = {
  getRecipients: async (params = {}) => {
    return apiClient.get('/recipients', { params });
  },

  getRecipientById: async (id) => {
    return apiClient.get(`/recipients/${id}`);
  },

  createRecipient: async (data) => {
    return apiClient.post('/recipients', data);
  },

  updateRecipient: async (id, data) => {
    return apiClient.put(`/recipients/${id}`, data);
  },

  deleteRecipient: async (id) => {
    return apiClient.delete(`/recipients/${id}`);
  },
};

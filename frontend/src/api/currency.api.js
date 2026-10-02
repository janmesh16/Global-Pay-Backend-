import { apiClient } from './client';

export const currencyApi = {
  getRates: async (from = 'USD', to = '') => {
    const params = { from };
    if (to) params.to = to;
    return apiClient.get('/currency/rates', { params });
  },

  convertPreview: async ({ from, to, amount }) => {
    return apiClient.get('/currency/convert', {
      params: { from, to, amount },
    });
  },
};

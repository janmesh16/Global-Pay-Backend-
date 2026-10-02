import { apiClient } from './client';

export const complianceApi = {
  submitKyc: async (data) => {
    // data: { documentType, documentNumber, documentUrl }
    return apiClient.post('/compliance/kyc-submit', data);
  },

  getComplianceLogs: async (params = {}) => {
    return apiClient.get('/compliance/logs', { params });
  },

  verifyComplianceItem: async (payload) => {
    // payload: { transactionId, status: 'approved' | 'rejected', notes }
    return apiClient.post('/compliance/verify', payload);
  },
};

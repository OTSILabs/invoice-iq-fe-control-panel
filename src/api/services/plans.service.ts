import api from '../axios';

export const plansService = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/plans');
    // If the API wraps it in a data object (e.g., response.data.data), adjust accordingly.
    // For now, assuming response.data is an array of plans.
    return response.data;
  },

  create: async (payload: any): Promise<any> => {
    const response = await api.post<any>('/plans', payload);
    return response.data;
  }
};

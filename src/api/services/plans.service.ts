import api from '../../lib/axios';

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
  },

  getById: async (id: string): Promise<any> => {
    try {
      const response = await api.get<any>(`/plans/${id}`);
      return response.data;
    } catch (error) {
      // Fallback: Retrieve all plans and filter by id locally
      const allPlans = await plansService.getAll();
      const plan = allPlans.find((p) => p.id === id);
      if (!plan) {
        throw new Error("Plan not found", { cause: error });
      }
      return plan;
    }
  }
};

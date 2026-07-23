import api from '../../lib/axios';


export const plansService = {
  getAll: async (params?: {
    limit?: number
    offset?: number
    search?: string
    status?: string
    plan_type?: string
  }): Promise<any[] & { total?: number }> => {
    const response = await api.get<{ items: any[]; total: number }>(
      "/plans",
      params ? { params } : undefined
    )
    const items = response.data.items as any[] & { total?: number }
    items.total = response.data.total
    return items
  },


  create: async (payload: any): Promise<any> => {
    const response = await api.post<any>('/plans', payload);
    return response.data;
  },

  update: async (id: string, payload: any): Promise<any> => {
    const response = await api.patch<any>(`/plans/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/plans/${id}`);
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

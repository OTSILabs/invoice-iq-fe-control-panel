import api from '../axios';
import type { Organization, Tenant } from '../../types';

export const organizationsService = {
  getAll: async (): Promise<Organization[]> => {
    const response = await api.get<Organization[]>('/organisations');
    return response.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await api.get<Organization>(`/organisations/${id}`);
    return response.data;
  },

  create: async (payload: any): Promise<Organization> => {
    const response = await api.post<Organization>('/organisations', payload);
    return response.data;
  },

  createTenant: async (orgId: string, payload: any): Promise<any> => {
    const response = await api.post<any>(`/organisations/${orgId}/tenants`, payload);
    return response.data;
  },

  getTenants: async (orgId: string): Promise<Tenant[]> => {
    const response = await api.get<Tenant[]>(`/organisations/${orgId}/tenants`);
    return response.data;
  }
};

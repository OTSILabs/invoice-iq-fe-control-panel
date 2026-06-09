import api from '../../lib/axios';
import type { Organization, Tenant, Configuration } from '../../types';

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
  },

  getConfigurations: async (orgId: string): Promise<Configuration[]> => {
    const response = await api.get<Configuration[]>(`/organisations/${orgId}/configurations`);
    return response.data;
  },

  updateConfigurations: async (orgId: string, payload: { values: Record<string, string> }): Promise<Configuration[]> => {
    const response = await api.post<Configuration[]>(`/organisations/${orgId}/configurations`, payload);
    return response.data;
  },

  getTenantConfigurations: async (tenantId: string): Promise<Configuration[]> => {
    const response = await api.get<Configuration[]>(`/tenants/${tenantId}/configurations`);
    return response.data;
  },

  updateTenantConfigurations: async (tenantId: string, payload: { values: Record<string, string> }): Promise<Configuration[]> => {
    const response = await api.post<Configuration[]>(`/tenants/${tenantId}/configurations`, payload);
    return response.data;
  },

  deleteTenant: async (tenantId: string): Promise<void> => {
    await api.delete(`/tenants/${tenantId}`);
  },

  deactivateTenant: async (tenantId: string): Promise<void> => {
    await api.post(`/tenants/${tenantId}/deactivate`, '');
  },

  activateTenant: async (tenantId: string): Promise<void> => {
    await api.post(`/tenants/${tenantId}/activate`, '');
  },

  getTenantEvents: async (tenantId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/tenants/${tenantId}/events`);
    return response.data;
  },

  blockTenant: async (tenantId: string, outcome: string): Promise<void> => {
    await api.post(`/tenants/${tenantId}/governance/block`, { outcome });
  },

  unblockTenant: async (tenantId: string, outcome: string): Promise<void> => {
    await api.post(`/tenants/${tenantId}/governance/unblock`, { outcome });
  },

  expireTenant: async (tenantId: string): Promise<void> => {
    await api.post(`/tenants/${tenantId}/expire`, '');
  },

  retryProvisioning: async (tenantId: string): Promise<Tenant> => {
    const response = await api.post<Tenant>(`/tenants/${tenantId}/retry-provisioning`, '');
    return response.data;
  },

  migrateTenant: async (tenantId: string): Promise<any> => {
    const response = await api.post<any>(`/tenants/${tenantId}/migrate`, '');
    return response.data;
  },

  assignPlan: async (tenantId: string, payload: { plan_id: string; valid_from?: string; valid_to?: string }): Promise<any> => {
    const response = await api.post<any>(`/tenants/${tenantId}/plan-assignments`, payload);
    return response.data;
  }
};

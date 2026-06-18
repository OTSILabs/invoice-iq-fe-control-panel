import api from '../../lib/axios';
import type { FieldCategoryResponse, FieldCategoryCreateRequest, FieldCategoryUpdateRequest } from '../../types';

export const fieldCategoriesService = {
  getAll: async (): Promise<FieldCategoryResponse[]> => {
    const response = await api.get<FieldCategoryResponse[]>('/api/platform-standard-content/field-categories');
    return response.data;
  },

  get: async (code: string): Promise<FieldCategoryResponse> => {
    const response = await api.get<FieldCategoryResponse>(`/api/platform-standard-content/field-categories/${code}`);
    return response.data;
  },

  create: async (payload: FieldCategoryCreateRequest): Promise<FieldCategoryResponse> => {
    const response = await api.post<FieldCategoryResponse>('/api/platform-standard-content/field-categories', payload);
    return response.data;
  },

  update: async (code: string, payload: FieldCategoryUpdateRequest): Promise<FieldCategoryResponse> => {
    const response = await api.patch<FieldCategoryResponse>(`/api/platform-standard-content/field-categories/${code}`, payload);
    return response.data;
  }
};

import api from '../../lib/axios';
import type {
  ReferenceListRegistryResponse,
  ReferenceListRegistryCreateRequest,
  ReferenceListRegistryUpdateRequest,
  ReferenceValueResponse,
  ReferenceValueCreateRequest,
  ReferenceValueUpdateRequest,
  ReferenceListRegistryPublicationResponse
} from '../../types';

export const referenceListsService = {
  getAll: async (): Promise<ReferenceListRegistryResponse[]> => {
    const response = await api.get<ReferenceListRegistryResponse[]>('/api/platform-standard-content/reference-lists');
    return response.data;
  },

  get: async (key: string): Promise<ReferenceListRegistryResponse> => {
    const response = await api.get<ReferenceListRegistryResponse>(`/api/platform-standard-content/reference-lists/${key}`);
    return response.data;
  },

  create: async (payload: ReferenceListRegistryCreateRequest): Promise<ReferenceListRegistryResponse> => {
    const response = await api.post<ReferenceListRegistryResponse>('/api/platform-standard-content/reference-lists', payload);
    return response.data;
  },

  update: async (key: string, payload: ReferenceListRegistryUpdateRequest): Promise<ReferenceListRegistryResponse> => {
    const response = await api.patch<ReferenceListRegistryResponse>(`/api/platform-standard-content/reference-lists/${key}`, payload);
    return response.data;
  },

  getValues: async (key: string): Promise<ReferenceValueResponse[]> => {
    const response = await api.get<ReferenceValueResponse[]>(`/api/platform-standard-content/reference-lists/${key}/values`);
    return response.data;
  },

  createValue: async (key: string, payload: ReferenceValueCreateRequest): Promise<ReferenceValueResponse> => {
    const response = await api.post<ReferenceValueResponse>(`/api/platform-standard-content/reference-lists/${key}/values`, payload);
    return response.data;
  },

  getValue: async (key: string, valueCode: string): Promise<ReferenceValueResponse> => {
    const response = await api.get<ReferenceValueResponse>(`/api/platform-standard-content/reference-lists/${key}/values/${valueCode}`);
    return response.data;
  },

  updateValue: async (key: string, valueCode: string, payload: ReferenceValueUpdateRequest): Promise<ReferenceValueResponse> => {
    const response = await api.patch<ReferenceValueResponse>(`/api/platform-standard-content/reference-lists/${key}/values/${valueCode}`, payload);
    return response.data;
  },

  listPublications: async (_apiKey?: string): Promise<ReferenceListRegistryPublicationResponse[]> => {
    void _apiKey;
    return [];
  }
};

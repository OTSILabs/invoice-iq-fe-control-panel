import api from "../../lib/axios";
import type {
  StandardDerivedTemplateResponse,
  StandardDerivedTemplateCreateRequest,
  StandardDerivedTemplateUpdateRequest
} from "../../types";

export const derivedTemplatesService = {
  list: async (): Promise<StandardDerivedTemplateResponse[]> => {
    const response = await api.get<StandardDerivedTemplateResponse[]>("/api/platform-standard-content/derived-templates");
    return response.data;
  },

  create: async (payload: StandardDerivedTemplateCreateRequest): Promise<StandardDerivedTemplateResponse> => {
    const response = await api.post<StandardDerivedTemplateResponse>("/api/platform-standard-content/derived-templates", payload);
    return response.data;
  },

  get: async (derivedTemplateId: string): Promise<StandardDerivedTemplateResponse> => {
    const response = await api.get<StandardDerivedTemplateResponse>(`/api/platform-standard-content/derived-templates/${derivedTemplateId}`);
    return response.data;
  },

  update: async (derivedTemplateId: string, payload: StandardDerivedTemplateUpdateRequest): Promise<StandardDerivedTemplateResponse> => {
    const response = await api.patch<StandardDerivedTemplateResponse>(`/api/platform-standard-content/derived-templates/${derivedTemplateId}`, payload);
    return response.data;
  },

  delete: async (derivedTemplateId: string): Promise<void> => {
    await api.delete(`/api/platform-standard-content/derived-templates/${derivedTemplateId}`);
  }
};

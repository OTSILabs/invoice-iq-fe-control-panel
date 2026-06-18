import api from "../../lib/axios";
import type {
  StandardExtractionTemplateResponse,
  StandardExtractionTemplateCreateRequest,
  StandardExtractionTemplateUpdateRequest
} from "../../types";

export const extractionTemplatesService = {
  list: async (): Promise<StandardExtractionTemplateResponse[]> => {
    const response = await api.get<StandardExtractionTemplateResponse[]>("/api/platform-standard-content/extraction-templates");
    return response.data;
  },

  create: async (payload: StandardExtractionTemplateCreateRequest): Promise<StandardExtractionTemplateResponse> => {
    const response = await api.post<StandardExtractionTemplateResponse>("/api/platform-standard-content/extraction-templates", payload);
    return response.data;
  },

  get: async (templateId: string): Promise<StandardExtractionTemplateResponse> => {
    const response = await api.get<StandardExtractionTemplateResponse>(`/api/platform-standard-content/extraction-templates/${templateId}`);
    return response.data;
  },

  update: async (templateId: string, payload: StandardExtractionTemplateUpdateRequest): Promise<StandardExtractionTemplateResponse> => {
    const response = await api.patch<StandardExtractionTemplateResponse>(`/api/platform-standard-content/extraction-templates/${templateId}`, payload);
    return response.data;
  }
};

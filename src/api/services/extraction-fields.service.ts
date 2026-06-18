import api from "../../lib/axios";
import type {
  StandardExtractionFieldResponse,
  StandardExtractionFieldCreateRequest,
  StandardExtractionFieldUpdateRequest
} from "../../types";

export const extractionFieldsService = {
  list: async (): Promise<StandardExtractionFieldResponse[]> => {
    const response = await api.get<StandardExtractionFieldResponse[]>("/api/platform-standard-content/extraction-fields");
    return response.data;
  },

  create: async (payload: StandardExtractionFieldCreateRequest): Promise<StandardExtractionFieldResponse> => {
    const response = await api.post<StandardExtractionFieldResponse>("/api/platform-standard-content/extraction-fields", payload);
    return response.data;
  },

  get: async (fieldId: string): Promise<StandardExtractionFieldResponse> => {
    const response = await api.get<StandardExtractionFieldResponse>(`/api/platform-standard-content/extraction-fields/${fieldId}`);
    return response.data;
  },

  update: async (fieldId: string, payload: StandardExtractionFieldUpdateRequest): Promise<StandardExtractionFieldResponse> => {
    const response = await api.patch<StandardExtractionFieldResponse>(`/api/platform-standard-content/extraction-fields/${fieldId}`, payload);
    return response.data;
  }
};

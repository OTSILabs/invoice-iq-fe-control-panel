import api from "../../lib/axios"
import type { NormalizationRule, CreateNormalizationRulePayload } from "../../types"

export const normalizationRulesService = {
  getNormalizationRules: async (): Promise<NormalizationRule[]> => {
    const response = await api.get<NormalizationRule[]>("/api/platform-standard-content/normalization-rules")
    return response.data
  },

  createNormalizationRule: async (payload: CreateNormalizationRulePayload): Promise<NormalizationRule> => {
    const response = await api.post<NormalizationRule>(
      "/api/platform-standard-content/normalization-rules",
      payload
    )
    return response.data
  },

  getNormalizationRule: async (rule_code: string): Promise<NormalizationRule> => {
    const response = await api.get<NormalizationRule>(
      `/api/platform-standard-content/normalization-rules/${rule_code}`
    )
    return response.data
  },

  updateNormalizationRule: async (
    rule_code: string,
    payload: Partial<CreateNormalizationRulePayload>
  ): Promise<NormalizationRule> => {
    const response = await api.patch<NormalizationRule>(
      `/api/platform-standard-content/normalization-rules/${rule_code}`,
      payload
    )
    return response.data
  },

  deleteNormalizationRule: async (rule_code: string): Promise<void> => {
    await api.delete(`/api/platform-standard-content/normalization-rules/${rule_code}`)
  },
}

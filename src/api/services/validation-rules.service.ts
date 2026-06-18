import api from "../../lib/axios"
import type { ValidationRule, CreateValidationRulePayload } from "../../types"

export const validationRulesService = {
  getValidationRules: async (): Promise<ValidationRule[]> => {
    const response = await api.get<ValidationRule[]>("/api/platform-standard-content/validation-rules")
    return response.data
  },

  createValidationRule: async (payload: CreateValidationRulePayload): Promise<ValidationRule> => {
    const response = await api.post<ValidationRule>(
      "/api/platform-standard-content/validation-rules",
      payload
    )
    return response.data
  },

  getValidationRule: async (rule_code: string): Promise<ValidationRule> => {
    const response = await api.get<ValidationRule>(
      `/api/platform-standard-content/validation-rules/${rule_code}`
    )
    return response.data
  },

  updateValidationRule: async (
    rule_code: string,
    payload: Partial<CreateValidationRulePayload>
  ): Promise<ValidationRule> => {
    const response = await api.patch<ValidationRule>(
      `/api/platform-standard-content/validation-rules/${rule_code}`,
      payload
    )
    return response.data
  },

  deleteValidationRule: async (rule_code: string): Promise<void> => {
    await api.delete(`/api/platform-standard-content/validation-rules/${rule_code}`)
  },
}

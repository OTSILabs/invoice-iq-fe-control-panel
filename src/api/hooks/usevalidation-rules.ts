import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { validationRulesService } from "../services/validation-rules.service"
import type { CreateValidationRulePayload } from "../../types"

export const useValidationRules = () => {
  return useQuery({
    queryKey: ["validation-rules"],
    queryFn: () => validationRulesService.getValidationRules(),
  })
}

export const useCreateValidationRuleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateValidationRulePayload) =>
      validationRulesService.createValidationRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validation-rules"] })
    },
  })
}

export const useValidationRule = (rule_code: string, enabled = true) => {
  return useQuery({
    queryKey: ["validation-rule", rule_code],
    queryFn: () => validationRulesService.getValidationRule(rule_code),
    enabled: !!rule_code && enabled,
  })
}

export const useUpdateValidationRuleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      rule_code,
      payload,
    }: {
      rule_code: string
      payload: Partial<CreateValidationRulePayload>
    }) => validationRulesService.updateValidationRule(rule_code, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["validation-rules"] })
      queryClient.invalidateQueries({ queryKey: ["validation-rule", variables.rule_code] })
    },
  })
}

export const useDeleteValidationRuleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rule_code: string) => validationRulesService.deleteValidationRule(rule_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validation-rules"] })
    },
  })
}

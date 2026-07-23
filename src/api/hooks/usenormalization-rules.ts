import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { normalizationRulesService } from "../services/normalization-rules.service"
import type { CreateNormalizationRulePayload } from "../../types"

export const useNormalizationRules = () => {
  return useQuery({
    queryKey: ["normalization-rules"],
    queryFn: () => normalizationRulesService.getNormalizationRules(),
  })
}

export const useCreateNormalizationRuleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateNormalizationRulePayload) =>
      normalizationRulesService.createNormalizationRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["normalization-rules"] })
    },
  })
}

export const useNormalizationRule = (rule_code: string, enabled = true) => {
  return useQuery({
    queryKey: ["normalization-rule", rule_code],
    queryFn: () => normalizationRulesService.getNormalizationRule(rule_code),
    enabled: !!rule_code && enabled,
  })
}

export const useUpdateNormalizationRuleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      rule_code,
      payload,
    }: {
      rule_code: string
      payload: Partial<CreateNormalizationRulePayload>
    }) => normalizationRulesService.updateNormalizationRule(rule_code, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["normalization-rules"] })
      queryClient.invalidateQueries({ queryKey: ["normalization-rule", variables.rule_code] })
    },
  })
}

export const useDeleteNormalizationRuleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rule_code: string) => normalizationRulesService.deleteNormalizationRule(rule_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["normalization-rules"] })
    },
  })
}

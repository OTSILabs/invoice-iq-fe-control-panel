import { z } from "zod"

export const normalizationRuleSchema = z.object({
  rule_code: z
    .string()
    .min(1, "Rule code is required")
    .max(50, "Rule code is too long")
    .regex(/^[a-z0-9_]+$/, "Code must be lowercase alphanumeric with underscores (e.g. clean_spaces)"),
  display_label: z.string().min(1, "Display label is required").max(100, "Display label is too long"),
  description: z.string().min(1, "Description is required").max(255, "Description is too long"),
  rule_mode: z.string().min(1, "Rule mode is required"),
  engine_type: z.string().max(50, "Engine type is too long").optional().or(z.literal("")),
  implementation_key: z.string().max(100, "Implementation key is too long").optional().or(z.literal("")),
  parameter_schema_json: z.string().refine((val) => {
    try {
      if (!val) return true
      JSON.parse(val)
      return true
    } catch {
      return false
    }
  }, "Parameter schema must be valid JSON"),
  engine_config_json: z.string().refine((val) => {
    try {
      if (!val) return true
      JSON.parse(val)
      return true
    } catch {
      return false
    }
  }, "Engine config must be valid JSON"),
  supported_data_types: z.string(),
  supported_header_items: z.string(),
  is_active: z.boolean(),
  sort_sequence: z.number().int().min(0, "Sort sequence must be a non-negative integer"),
})

export type NormalizationRuleFormValues = z.infer<typeof normalizationRuleSchema>

export const DEFAULT_NORMALIZATION_RULE_VALUES: NormalizationRuleFormValues = {
  rule_code: "",
  display_label: "",
  description: "",
  rule_mode: "DECLARATIVE",
  engine_type: "",
  implementation_key: "",
  parameter_schema_json: "{}",
  engine_config_json: "{}",
  supported_data_types: "",
  supported_header_items: "",
  is_active: true,
  sort_sequence: 1,
}

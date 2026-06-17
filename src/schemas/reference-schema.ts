import { z } from "zod"

export const referenceRegistrySchema = z.object({
  registry_key: z
    .string()
    .min(1, "Registry Key is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Registry Key must be alphanumeric with underscores"),
  display_label: z.string().min(1, "Display Label is required"),
  description: z.string().optional().default(""),
  source_type: z.string().min(1, "Source Type is required"),
  sort_sequence: z.number().min(1, "Sort Sequence must be at least 1"),
})

export type ReferenceRegistryFormValues = z.infer<typeof referenceRegistrySchema>

export const DEFAULT_REGISTRY_VALUES: ReferenceRegistryFormValues = {
  registry_key: "",
  display_label: "",
  description: "",
  source_type: "custom",
  sort_sequence: 1,
}

export const referenceValueSchema = z.object({
  value_code: z
    .string()
    .min(1, "Value Code is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Value Code must be alphanumeric with underscores"),
  value_label: z.string().min(1, "Value Label is required"),
  description: z.string().optional().default(""),
  sort_sequence: z.number().min(1, "Sort Sequence must be at least 1"),
  attributes_raw: z.string().optional().default("").refine((val) => {
    if (!val || !val.trim()) return true
    try {
      const parsed = JSON.parse(val)
      return typeof parsed === "object" && parsed !== null
    } catch {
      return false
    }
  }, "Attributes must be a valid JSON object (e.g. {\"key\": \"value\"})"),
})

export type ReferenceValueFormValues = z.infer<typeof referenceValueSchema>

export const DEFAULT_VALUE_VALUES: ReferenceValueFormValues = {
  value_code: "",
  value_label: "",
  description: "",
  sort_sequence: 1,
  attributes_raw: "",
}

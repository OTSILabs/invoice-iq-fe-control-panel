import { z } from "zod"

export const createDataTypeSchema = z.object({
  data_type_code: z
    .string()
    .min(1, "Data type code is required")
    .max(50, "Code is too long")
    .regex(/^[a-z0-9_]+$/, "Code must be lowercase alphanumeric with underscores (e.g. string, date_time)"),
  display_label: z.string().min(1, "Display label is required").max(100, "Display label is too long"),
  description: z.string().min(1, "Description is required").max(255, "Description is too long"),
  sample_value: z.string().min(1, "Sample value is required").max(255, "Sample value is too long"),
  sort_sequence: z.number().int().min(0, "Sort sequence must be a non-negative integer"),
})

export type CreateDataTypeFormValues = z.infer<typeof createDataTypeSchema>

export const DEFAULT_CREATE_DATA_TYPE_VALUES: CreateDataTypeFormValues = {
  data_type_code: "",
  display_label: "",
  description: "",
  sample_value: "",
  sort_sequence: 1,
}

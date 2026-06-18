import { z } from "zod"

export const fieldCategorySchema = z.object({
  field_category_code: z.string().min(1, "Field Category Code is required"),
  ui_label: z.string().min(1, "UI Label is required"),
  description: z.string().min(1, "Description is required"),
  example_fields_raw: z.string(),
  sort_sequence: z.number().min(1, "Sort Sequence must be at least 1"),
})

export type FieldCategoryFormValues = z.infer<typeof fieldCategorySchema>

export const DEFAULT_FIELD_CATEGORY_VALUES: FieldCategoryFormValues = {
  field_category_code: "",
  ui_label: "",
  description: "",
  example_fields_raw: "",
  sort_sequence: 1,
}

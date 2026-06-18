import { z } from "zod";

// --- Extraction Fields Schema ---
export const extractionFieldSchema = z.object({
  field_id: z
    .string()
    .min(1, "Field ID is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Field ID must be alphanumeric with underscores"),
  field_label: z.string().min(1, "Field Label is required"),
  short_desc: z.string(),
  field_long_description: z.string(),
  data_type_code: z.string().min(1, "Data Type is required"),
  labels_raw: z.string(),
  examples_raw: z.string(),
  extraction_instructions_raw: z.string(),
  header_item: z.enum(["header", "item"]),
  allowed_value_mode: z.enum(["any", "static_list", "reference_list"]),
  allowed_static_list_raw: z.string(),
  allowed_reference_registry_key: z.string(),
  default_value: z.string(),
  field_category_code: z.string().min(1, "Field Category is required"),
});

export type ExtractionFieldFormValues = z.infer<typeof extractionFieldSchema>;

export const DEFAULT_FIELD_VALUES: ExtractionFieldFormValues = {
  field_id: "",
  field_label: "",
  short_desc: "",
  field_long_description: "",
  data_type_code: "",
  labels_raw: "",
  examples_raw: "",
  extraction_instructions_raw: "",
  header_item: "header",
  allowed_value_mode: "any",
  allowed_static_list_raw: "",
  allowed_reference_registry_key: "",
  default_value: "",
  field_category_code: "",
};

// --- Extraction Templates Schema ---
export const extractionTemplateSchema = z.object({
  template_id: z
    .string()
    .min(1, "Template ID is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Template ID must be alphanumeric with underscores"),
  name: z.string().min(1, "Template Name is required"),
  description: z.string(),
  business_process_tags_raw: z.string(),
  document_type_tags_raw: z.string(),
  taxation_tags_raw: z.string(),
  field_ids: z.array(z.string()).min(1, "At least one field must be selected for the template"),
});

export type ExtractionTemplateFormValues = z.infer<typeof extractionTemplateSchema>;

export const DEFAULT_TEMPLATE_VALUES: ExtractionTemplateFormValues = {
  template_id: "",
  name: "",
  description: "",
  business_process_tags_raw: "",
  document_type_tags_raw: "",
  taxation_tags_raw: "",
  field_ids: [],
};

// --- Derived Templates Schema ---
export const derivedTemplateSchema = z.object({
  derived_template_id: z
    .string()
    .min(1, "Derived Template ID is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Derived Template ID must be alphanumeric with underscores"),
  template_id: z.string().min(1, "Base Template is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
});

export type DerivedTemplateFormValues = z.infer<typeof derivedTemplateSchema>;

export const DEFAULT_DERIVED_TEMPLATE_VALUES: DerivedTemplateFormValues = {
  derived_template_id: "",
  template_id: "",
  name: "",
  description: "",
};

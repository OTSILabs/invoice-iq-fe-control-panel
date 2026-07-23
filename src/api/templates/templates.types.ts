import type { ApiId, ApiParams, ApiRecord } from "@/api/templates/api.helpers";

type Nullable<T> = T | null;

export type TemplatePathId = ApiId;
export const TEMPLATE_CONTENT_TYPES = {
  STANDARD: "Standard",
  CUSTOM: "Custom",
} as const;
export type TemplateContentType =
  (typeof TEMPLATE_CONTENT_TYPES)[keyof typeof TEMPLATE_CONTENT_TYPES];

export interface TemplatePaginationParams extends ApiParams {
  limit?: number;
  offset?: number;
}

export interface ExtractionFieldsListParams extends TemplatePaginationParams {
  field_id?: Nullable<string>;
  field_label?: Nullable<string>;
  short_desc?: Nullable<string>;
  data_type_code?: Nullable<string>;
  field_category_code?: Nullable<string>;
  content_type?: Nullable<TemplateContentType>;
}

export interface ExtractionTemplatesListParams extends TemplatePaginationParams {
  template_id?: Nullable<string>;
  name?: Nullable<string>;
  content_type?: Nullable<TemplateContentType>;
}

export interface FieldCategoriesListParams extends ApiParams {
  search?: Nullable<string>;
}

export interface ActiveToggleRequest extends ApiRecord {
  is_active: boolean;
}

export interface CustomFieldRequest extends ApiRecord {
  field_id: string;
  field_label: string;
  short_desc?: Nullable<string>;
  field_long_description?: Nullable<string>;
  data_type_code: string;
  labels?: string[];
  examples?: string[];
  extraction_instructions?: string[];
  header_item: string;
  field_source_mode?: string;
  allowed_value_mode?: string;
  allowed_static_list?: string[];
  allowed_reference_registry_key?: Nullable<string>;
  default_value?: Nullable<string>;
  field_category_code: string;
}

export interface CustomFieldUpdateRequest extends ApiRecord {
  field_label?: Nullable<string>;
  short_desc?: Nullable<string>;
  field_long_description?: Nullable<string>;
  data_type_code?: Nullable<string>;
  labels?: Nullable<string[]>;
  examples?: Nullable<string[]>;
  extraction_instructions?: Nullable<string[]>;
  header_item?: Nullable<string>;
  field_source_mode?: Nullable<string>;
  allowed_value_mode?: Nullable<string>;
  allowed_static_list?: Nullable<string[]>;
  allowed_reference_registry_key?: Nullable<string>;
  default_value?: Nullable<string>;
  field_category_code?: Nullable<string>;
}

export interface ExtractionFieldResponse extends ApiRecord {
  field_id: string;
  field_label?: Nullable<string>;
  short_desc?: Nullable<string>;
  field_long_description?: Nullable<string>;
  data_type_code?: Nullable<string>;
  header_item?: Nullable<string>;
  field_source_mode?: Nullable<string>;
  content_type?: Nullable<TemplateContentType>;
  is_editable?: Nullable<boolean>;
  allowed_value_mode?: Nullable<string>;
  allowed_reference_registry_key?: Nullable<string>;
  default_value?: Nullable<string>;
  field_category_code?: Nullable<string>;
  is_active?: Nullable<boolean>;
  activated_at?: Nullable<string>;
  last_synced_at?: Nullable<string>;
  created_by?: Nullable<number>;
  created_at?: Nullable<string>;
  updated_at?: Nullable<string>;
  source_platform_field_id?: Nullable<string>;
  source_platform_version_no?: Nullable<number>;
  source_parent_field_id?: Nullable<string>;
  root_platform_field_id?: Nullable<string>;
  labels?: string[];
  examples?: string[];
  extraction_instructions?: string[];
  allowed_static_list?: unknown[];
}

export interface ExtractionFieldListResponse extends ApiRecord {
  fields?: ExtractionFieldResponse[];
  total?: number;
}

export interface TemplateMembershipInput extends ApiRecord {
  field_id: string;
  is_required?: boolean;
  header_item?: Nullable<string>;
  source_mode?: Nullable<string>;
  sort_sequence?: Nullable<number>;
  validation_rules?: unknown[];
  normalization_rules?: unknown[];
}

export interface NewTemplateFieldInput extends CustomFieldRequest {
  is_required?: boolean;
  sort_sequence?: Nullable<number>;
}

export interface TemplateMembershipResponse extends ApiRecord {
  template_field_id?: Nullable<string>;
  template_id?: Nullable<string>;
  field_id: string;
  header_item?: Nullable<string>;
  source_mode?: Nullable<string>;
  sort_sequence?: Nullable<number>;
  is_required?: Nullable<boolean>;
  content_type?: Nullable<TemplateContentType>;
  is_editable?: Nullable<boolean>;
  is_active?: Nullable<boolean>;
  field_label?: Nullable<string>;
  short_desc?: Nullable<string>;
  data_type_code?: Nullable<string>;
  field_category_code?: Nullable<string>;
}

export interface ExtractionTemplateCreateRequest extends ApiRecord {
  template_id?: Nullable<string>;
  name: string;
  description?: Nullable<string>;
  business_process_tags?: string[];
  document_type_tags?: string[];
  taxation_tags?: string[];
  field_membership?: TemplateMembershipInput[];
  is_active?: boolean;
}

export interface ExtractionTemplateUpdateRequest extends ApiRecord {
  template_id?: Nullable<string>;
  name?: Nullable<string>;
  description?: Nullable<string>;
  business_process_tags?: Nullable<string[]>;
  document_type_tags?: Nullable<string[]>;
  taxation_tags?: Nullable<string[]>;
  field_membership?: Nullable<TemplateMembershipInput[]>;
  is_active?: Nullable<boolean>;
}

export interface ExtractionTemplateCloneRequest extends ApiRecord {
  template_id?: Nullable<string>;
  name: string;
  description?: Nullable<string>;
}

export interface ExtractionTemplateResponse extends ApiRecord {
  template_id: string;
  source_platform_template_id?: Nullable<string>;
  source_platform_version_no?: Nullable<number>;
  name?: Nullable<string>;
  description?: Nullable<string>;
  content_type?: Nullable<TemplateContentType>;
  is_editable?: Nullable<boolean>;
  is_active?: Nullable<boolean>;
  activated_at?: Nullable<string>;
  last_synced_at?: Nullable<string>;
  created_by?: Nullable<number>;
  created_at?: Nullable<string>;
  updated_at?: Nullable<string>;
  business_process_tags?: string[];
  document_type_tags?: string[];
  taxation_tags?: string[];
  field_count?: Nullable<number>;
  field_membership?: Nullable<TemplateMembershipResponse[]>;
}

export interface ExtractionTemplateListResponse extends ApiRecord {
  templates?: ExtractionTemplateResponse[];
  total?: number;
}

export interface FieldCategoryCreateRequest extends ApiRecord {
  field_category_code: string;
  ui_label: string;
  description?: Nullable<string>;
  example_fields?: string[];
  sort_sequence?: number;
  is_active?: boolean;
}

export interface FieldCategoryUpdateRequest extends ApiRecord {
  ui_label?: Nullable<string>;
  description?: Nullable<string>;
  example_fields?: Nullable<string[]>;
  sort_sequence?: Nullable<number>;
  is_active?: Nullable<boolean>;
}

export interface FieldCategoryResponse extends ApiRecord {
  field_category_code: string;
  source_platform_field_category_code?: Nullable<string>;
  source_platform_version_no?: Nullable<number>;
  ui_label?: Nullable<string>;
  description?: Nullable<string>;
  sort_sequence?: Nullable<number>;
  active_field_count?: Nullable<number>;
  inactive_field_count?: Nullable<number>;
  content_type?: Nullable<TemplateContentType>;
  is_editable?: Nullable<boolean>;
  is_active?: Nullable<boolean>;
  activated_at?: Nullable<string>;
  last_synced_at?: Nullable<string>;
  created_by?: Nullable<number>;
  created_at?: Nullable<string>;
  updated_at?: Nullable<string>;
  example_fields?: string[];
}

export interface FieldCategoryListResponse extends ApiRecord {
  field_categories?: FieldCategoryResponse[];
}

export interface FieldCategoryFieldsResponse extends ApiRecord {
  field_category_code: string;
  fields?: ExtractionFieldResponse[];
}

export interface TemplateFieldOrderRequest extends ApiRecord {
  field_ids: string[];
}

export type TemplateAddFieldRequest = TemplateMembershipInput;

export interface TemplateMembershipUpdateRequest extends ApiRecord {
  is_required?: Nullable<boolean>;
  header_item?: Nullable<string>;
  source_mode?: Nullable<string>;
  sort_sequence?: Nullable<number>;
}

export interface DeleteResponse extends ApiRecord {
  deleted?: boolean;
}

export interface FieldDataTypeCatalogItem extends ApiRecord {
  data_type_code: string;
  display_label?: Nullable<string>;
  description?: Nullable<string>;
  sample_value?: Nullable<string>;
  sort_sequence?: Nullable<number>;
  version_no?: Nullable<number>;
  created_by?: Nullable<number>;
  created_at?: Nullable<string>;
  updated_at?: Nullable<string>;
}

export interface FieldCatalogsResponse extends ApiRecord {
  data_types?: FieldDataTypeCatalogItem[];
}

export type TemplateRecord = ExtractionTemplateResponse;
export type TemplateFieldRecord = ExtractionFieldResponse;
export type TemplatesListResponse = ExtractionTemplateListResponse;
export type TemplateFieldsListResponse = ExtractionFieldListResponse;
export type TemplateActionResponse =
  | ExtractionTemplateResponse
  | ExtractionFieldResponse
  | FieldCategoryResponse
  | DeleteResponse;
export type TemplateSortPayload = TemplateFieldOrderRequest;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Plan {
  id: string;
  description: string;
  plan_type: string;
  plan_interval: string;
  price_per_invoice_amount: number;
  price_per_invoice_currency: string;
  is_active: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tenant_role: string;
  plan_id?: string;
  tenant_count?: number;
  status?: string;
  onboarding_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: string;
  organisation_id: string;
  slug: string;
  tenant_role: string;
  configurations?: Record<string, unknown>;
  profile?: {
    display_name?: string;
    domain_name?: string;
    reporting_currency?: string;
    timezone?: string;
  };
  provisioning_status?: string;
  access_status?: string;
  governance_blocked?: boolean;
  governance_outcome?: string | null;
  effective_plan_id?: string;
  effective_plan_valid_from?: string;
  effective_plan_valid_to?: string;
  tenant_admin_email?: string;
  tenant_admin_full_name?: string;
  db_name?: string;
  db_host?: string;
  db_port?: number;
  db_user?: string;
  provisioned_at?: string;
  last_error?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlatformUserPayload {
  email: string;
  password?: string;
  full_name: string;
  role_names: string[];
  status: "ACTIVE" | "INACTIVE";
}

export interface PlatformUser {
  id: string;
  full_name: string;
  email: string;
  role_names?: string[];
  roles?: unknown[];
  role?: string;
  role_name?: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
}

export interface PlatformRole {
  id: string;
  name: string;
  description?: string;
}

export interface ErpSetting {
  erp_id: number;
  erp_type: string;
  display_name?: string;
  is_enabled?: boolean;
  settings: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateErpSettingPayload {
  erp_type: string;
  settings: Record<string, unknown>;
}
export interface Configuration {
  key: string;
  value: string;
  is_active: boolean;
  is_editable_by_tenant: boolean;
}

export interface ProfileEntry {
  key: string;
  value: string;
  is_active: boolean;
  is_tenant_editable: boolean;
  is_visible_to_tenant: boolean;
}

export interface FieldCategoryResponse {
  field_category_code: string;
  ui_label: string;
  description: string;
  example_fields: string[];
  sort_sequence: number;
  version_no: number;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FieldCategoryCreateRequest {
  field_category_code: string;
  ui_label: string;
  description: string;
  example_fields?: string[];
  sort_sequence?: number;
}

export interface FieldCategoryUpdateRequest {
  field_category_code?: string;
  ui_label?: string;
  description?: string;
  example_fields?: string[];
  sort_sequence?: number;
}


export interface FieldCategoryResponse {
  field_category_code: string;
  ui_label: string;
  description: string;
  example_fields: string[];
  sort_sequence: number;
  version_no: number;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FieldCategoryCreateRequest {
  field_category_code: string;
  ui_label: string;
  description: string;
  example_fields?: string[];
  sort_sequence?: number;
}

export interface FieldCategoryUpdateRequest {
  field_category_code?: string;
  ui_label?: string;
  description?: string;
  example_fields?: string[];
  sort_sequence?: number;
}


export interface DataType {
  data_type_id?: string;
  id?: string;
  data_type_code: string;
  display_label: string;
  description: string;
  sample_value?: string;
  sort_sequence?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDataTypePayload {
  data_type_code: string;
  display_label: string;
  description: string;
  sample_value: string;
  sort_sequence: number;
}

export interface ValidationRule {
  id?: string;
  rule_code: string;
  display_label: string;
  description: string;
  rule_mode: string;
  engine_type: string | null;
  implementation_key: string | null;
  parameter_schema_json: Record<string, any>;
  engine_config_json: Record<string, any>;
  supported_data_types_json: string[];
  supported_header_items_json: string[];
  is_active: boolean;
  sort_sequence: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateValidationRulePayload {
  rule_code: string;
  display_label: string;
  description: string;
  rule_mode: string;
  engine_type: string | null;
  implementation_key: string | null;
  parameter_schema_json: Record<string, any>;
  engine_config_json: Record<string, any>;
  supported_data_types_json: string[];
  supported_header_items_json: string[];
  is_active: boolean;
  sort_sequence: number;
}


import type * as React from "react"
import type { UseFormRegister, FieldErrors, UseFormReturn } from "react-hook-form"
import type { ExtractionFieldFormValues } from "@/schemas/extraction-schema"
import type { LucideIcon } from "lucide-react"
import type { QueryKey } from "@tanstack/react-query"
import type {
  CategorizedFieldSelectorCategory,
  CategorizedFieldSelectorItem,
  CategorizedFieldSelectorLoadResult,
} from "@/components/ui/categorized-field-selector.utils"

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Plan {
  id: string
  description: string
  plan_type: string
  plan_interval: string
  price_per_invoice_amount: number
  price_per_invoice_currency: string
  is_active: boolean
  created_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  tenant_role: string
  plan_id?: string
  tenant_count?: number
  status?: string
  onboarding_status?: string
  created_at?: string
  updated_at?: string
}

export interface Tenant {
  id: string
  organisation_id: string
  slug: string
  tenant_role: string
  configurations?: Record<string, unknown>
  profile?: {
    display_name?: string
    domain_name?: string
    reporting_currency?: string
    timezone?: string
  }
  provisioning_status?: string
  access_status?: string
  governance_blocked?: boolean
  governance_outcome?: string | null
  effective_plan_id?: string
  effective_plan_valid_from?: string
  effective_plan_valid_to?: string
  tenant_admin_email?: string
  tenant_admin_full_name?: string
  db_name?: string
  db_host?: string
  db_port?: number
  db_user?: string
  provisioned_at?: string
  last_error?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreatePlatformUserPayload {
  email: string
  password?: string
  full_name: string
  role_names: string[]
  status: "ACTIVE" | "INACTIVE"
}

export interface PlatformUser {
  id: string
  full_name: string
  email: string
  role_names?: string[]
  roles?: unknown[]
  role?: string
  role_name?: string
  status: "ACTIVE" | "INACTIVE"
  created_at: string
}

export interface PlatformRole {
  id: string
  name: string
  description?: string
}

export interface ErpSetting {
  erp_id: number
  erp_type: string
  display_name?: string
  is_enabled?: boolean
  settings: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface CreateErpSettingPayload {
  erp_type: string
  is_enabled?: boolean
  settings: Record<string, unknown>
}
export interface Configuration {
  key: string
  value: string
  is_active: boolean
  is_editable_by_tenant: boolean
}

export interface ProfileEntry {
  key: string
  value: string
  is_active: boolean
  is_tenant_editable: boolean
  is_visible_to_tenant: boolean
}

export interface FieldCategoryResponse {
  field_category_code: string
  ui_label: string
  description: string
  example_fields: string[]
  sort_sequence: number
  version_no: number
  created_by?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface FieldCategoryCreateRequest {
  field_category_code: string
  ui_label: string
  description: string
  example_fields?: string[]
  sort_sequence?: number
}

export interface FieldCategoryUpdateRequest {
  field_category_code?: string
  ui_label?: string
  description?: string
  example_fields?: string[]
  sort_sequence?: number
}

export interface DataType {
  data_type_id?: string
  id?: string
  data_type_code: string
  display_label: string
  description: string
  sample_value?: string
  sort_sequence?: number
  created_at?: string
  updated_at?: string
}

export interface CreateDataTypePayload {
  data_type_code: string
  display_label: string
  description: string
  sample_value: string
  sort_sequence: number
}

export interface ReferenceListRegistryResponse {
  registry_key: string
  display_label: string
  description?: string | null
  source_type: string
  sort_sequence: number
  version_no: number
  created_by?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ReferenceListRegistryPublicationResponse {
  registry_key: string
  display_label: string
  description?: string | null
  source_type: string
  sort_sequence: number
  version_no: number
  created_by?: number | null
  created_at?: string | null
  updated_at?: string | null
  values: ReferenceValueResponse[]
}

export interface ReferenceListRegistryCreateRequest {
  registry_key: string
  display_label: string
  description?: string | null
  source_type?: string
  sort_sequence?: number
}

export interface ReferenceListRegistryUpdateRequest {
  registry_key?: string | null
  display_label?: string | null
  description?: string | null
  source_type?: string | null
  sort_sequence?: number | null
}

export interface ReferenceValueResponse {
  registry_key: string
  value_code: string
  value_label: string
  description?: string | null
  attributes?: Record<string, unknown> | null
  sort_sequence: number
  version_no: number
  created_by?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ReferenceValueCreateRequest {
  value_code: string
  value_label: string
  description?: string | null
  attributes?: Record<string, unknown> | null
  sort_sequence?: number
}

export interface ReferenceValueUpdateRequest {
  value_code?: string | null
  value_label?: string | null
  description?: string | null
  attributes?: Record<string, unknown> | null
  sort_sequence?: number | null
}

export interface ValidationRule {
  id?: string
  rule_code: string
  display_label: string
  description: string
  rule_mode: string
  engine_type: string | null
  implementation_key: string | null
  parameter_schema_json: Record<string, unknown>
  engine_config_json: Record<string, unknown>
  supported_data_types_json: string[]
  supported_header_items_json: string[]
  is_active: boolean
  sort_sequence: number
  created_at?: string
  updated_at?: string
}

export interface CreateValidationRulePayload {
  rule_code: string
  display_label: string
  description: string
  rule_mode: string
  engine_type: string | null
  implementation_key: string | null
  parameter_schema_json: Record<string, unknown>
  engine_config_json: Record<string, unknown>
  supported_data_types_json: string[]
  supported_header_items_json: string[]
  sort_sequence: number
}

export interface NormalizationRule {
  id?: string
  rule_code: string
  display_label: string
  description: string
  rule_mode: string
  engine_type: string | null
  implementation_key: string | null
  parameter_schema_json: Record<string, unknown>
  engine_config_json: Record<string, unknown>
  supported_data_types_json: string[]
  supported_header_items_json: string[]
  is_active: boolean
  sort_sequence: number
  created_at?: string
  updated_at?: string
}

export interface CreateNormalizationRulePayload {
  rule_code: string
  display_label: string
  description: string
  rule_mode: string
  engine_type: string | null
  implementation_key: string | null
  parameter_schema_json: Record<string, unknown>
  engine_config_json: Record<string, unknown>
  supported_data_types_json: string[]
  supported_header_items_json: string[]
  is_active: boolean
  sort_sequence: number
}
// --- Extraction Fields ---
export interface StandardExtractionFieldResponse {
  field_id: string
  field_label: string
  short_desc?: string | null
  field_long_description?: string | null
  data_type_code: string
  labels?: string[] | null
  examples?: string[] | null
  extraction_instructions?: string[] | null
  header_item: string
  content_type: string
  field_source_mode?: string
  allowed_value_mode: string
  allowed_static_list?: string[] | null
  allowed_reference_registry_key?: string | null
  default_value?: string | null
  field_category_code: string
  version_no: number
  data_type: DataType
  field_category: FieldCategoryResponse
  reference_list?: ReferenceListRegistryResponse | null
  created_by?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface StandardExtractionFieldCreateRequest {
  field_id: string
  field_label: string
  short_desc?: string | null
  field_long_description?: string | null
  data_type_code: string
  labels?: string[] | null
  examples?: string[] | null
  extraction_instructions?: string[] | null
  header_item: string
  allowed_value_mode: string
  allowed_static_list?: string[] | null
  allowed_reference_registry_key?: string | null
  default_value?: string | null
  field_category_code: string
}

export interface StandardExtractionFieldUpdateRequest {
  field_id?: string | null
  field_label?: string | null
  short_desc?: string | null
  field_long_description?: string | null
  data_type_code?: string | null
  labels?: string[] | null
  examples?: string[] | null
  extraction_instructions?: string[] | null
  header_item?: string | null
  allowed_value_mode?: string | null
  allowed_static_list?: string[] | null
  allowed_reference_registry_key?: string | null
  default_value?: string | null
  field_category_code?: string | null
}

// --- Extraction Templates ---
export interface StandardTemplateFieldMembershipResponse {
  template_field_id: string
  sort_sequence: number
  source_mode: string
  validation_rules?: string[] | null
  normalization_rules?: string[] | null
  derivation_implementations?: string[] | null
  field: StandardExtractionFieldResponse
}

export interface StandardTemplateFieldMembershipRequest {
  field_id: string
  sort_sequence: number
  source_mode?: string
  validation_rules?: string[]
  normalization_rules?: string[]
  derivation_implementations?: string[]
}

export interface StandardExtractionTemplateResponse {
  template_id: string
  name: string
  description?: string | null
  content_type: string
  business_process_tags?: string[] | null
  document_type_tags?: string[] | null
  taxation_tags?: string[] | null
  version_no: number
  field_membership?: StandardTemplateFieldMembershipResponse[] | null
  created_by?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface StandardExtractionTemplateCreateRequest {
  template_id: string
  name: string
  description?: string | null
  business_process_tags?: string[]
  document_type_tags?: string[]
  taxation_tags?: string[]
  field_membership: StandardTemplateFieldMembershipRequest[]
}

export interface StandardExtractionTemplateUpdateRequest {
  template_id?: string | null
  name?: string | null
  description?: string | null
  business_process_tags?: string[] | null
  document_type_tags?: string[] | null
  taxation_tags?: string[] | null
  field_membership?: StandardTemplateFieldMembershipRequest[] | null
}

// --- Derived Templates ---
export interface StandardDerivedTemplateResponse {
  derived_template_id: string
  name: string
  description?: string | null
  erp_type?: string
  document_type_code?: string
  is_active?: boolean
  template_id?: string
  version_no: number
  created_at?: string | null
  updated_at?: string | null
  base_template?: StandardExtractionTemplateResponse
  field_membership?: StandardDerivedTemplateFieldMembershipRequest[] | null
}

export interface StandardDerivedTemplateFieldMembershipRequest {
  field_id: string
  header_item?: string
  sort_sequence: number
  is_required?: boolean
  implementation_key?: string
  input_field_ids?: string[]
  params?: Record<string, any>
  execution_stage?: string
  failure_policy?: string
  is_active?: boolean
}

export interface StandardDerivedTemplateCreateRequest {
  derived_template_id: string
  name: string
  description?: string | null
  erp_type: string
  document_type_code: string
  is_active: boolean
  field_membership?: StandardDerivedTemplateFieldMembershipRequest[]
}

export interface StandardDerivedTemplateUpdateRequest {
  name?: string
  description?: string | null
  is_active?: boolean
  erp_type?: string
  document_type_code?: string
}

// --- Component UI Props ---
export interface FieldsTableProps {
  data: StandardExtractionFieldResponse[]
  isLoading: boolean
  isFetching: boolean
  onEdit: (item: StandardExtractionFieldResponse) => void
  searchText: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
}

export interface DerivedTableProps {
  data: StandardDerivedTemplateResponse[]
  isLoading: boolean
  isFetching: boolean
  onDelete: (id: string) => void
  searchText: string
  onSearchChange: (value: string) => void
  onRefresh: () => void
  onView?: (item: StandardDerivedTemplateResponse) => void
}

export interface ExtractionManagementState {
  activeTab: string;
  searchText: string;
}

export interface FieldDialogDetailsStepProps {
  register: UseFormRegister<ExtractionFieldFormValues>;
  errors: FieldErrors<ExtractionFieldFormValues>;
  categories: any[];
  dataTypes: any[];
  isEdit: boolean;
  isSaving: boolean;
}

export interface FieldDialogMeaningStepProps {
  register: UseFormRegister<ExtractionFieldFormValues>;
  errors: FieldErrors<ExtractionFieldFormValues>;
  isSaving: boolean;
}

export interface FieldDialogRulesStepProps {
  register: UseFormRegister<ExtractionFieldFormValues>;
  errors: FieldErrors<ExtractionFieldFormValues>;
  valueMode: string;
  referenceLists: any[];
  isSaving: boolean;
  isEdit?: boolean;
}

export interface FieldDialogSidebarProps {
  activeStepIndex: number;
  handleStepChange: (index: number) => void;
  steps: readonly {
    readonly title: string;
    readonly description: string;
    readonly fields: readonly string[];
  }[];
}

export interface ConfigurationsTableHeaderProps {
  entityType: 'organization' | 'tenant'
  isSaving: boolean
  hasChanges: boolean
  onSave: () => void
}

export interface ConfigurationsTableProps {
  entityId: string
  entityType: 'organization' | 'tenant'
}

export interface EditableValueCellProps {
  configKey: string
  initialValue: string
  isSaving: boolean
  isBoolean: boolean
  referenceKey?: string | null
  onValueChange: (key: string, value: string) => void
}

export interface OrganizationTenantsTabProps {
  orgId: string
  organizationName: string
}

export interface ProfileEditableValueCellProps {
  configKey: string
  initialValue: string
  isSaving: boolean
  isBoolean: boolean
  referenceKey?: string | null
  onValueChange: (key: string, value: string) => void
}

export interface ProfileTableHeaderProps {
  entityType: 'organization' | 'tenant'
  isSaving: boolean
  hasChanges: boolean
  onSave: () => void
}

export interface ProfileTableProps {
  entityId: string
  entityType: 'organization' | 'tenant'
}

export interface OrganizationSectionProps {
  existingOrganization?: { id: string; name: string }
  organizations: Organization[]
  isOrgsLoading: boolean
  isCreatingOrg: boolean
  selectedOrgId: string
  handleToggleCreatingOrg: (value: boolean) => void
  handleOrgChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export interface PlanSelectionSectionProps {
  plans?: Plan[]
  isPlansLoading: boolean
  isCreatingPlan: boolean
  setIsCreatingPlan: (value: boolean) => void
  handleInlinePlanSuccess: (newPlan?: { id?: string } | null) => void
}

export interface ReplicationStepProps {
  createdTenant: CreatedTenantState
  isReplicating: boolean
  replicationSettings: ReplicationSettings
  setReplicationSettings: React.Dispatch<React.SetStateAction<ReplicationSettings>>
  onSkip: () => void
  onReplicate: () => void
}

export interface TenantActionsDropdownProps {
  tenant: Tenant;
  orgId: string;
  setTenantAction: (action: { type: "deactivate" | "activate" | "block" | "unblock" | "expire" | "delete", tenant: Tenant } | null) => void;
}

export interface PlanFormProps {
  onSuccess?: (data?: Plan) => void
  onCancel?: () => void
  mode?: "create" | "edit"
  plan?: Plan | null
  showFooter?: boolean
  formId?: string
}

export interface DeleteNormalizationRuleDialogProps {
  deletingRule: NormalizationRule | null
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export interface RegistryDetailsCardProps {
  registry: {
    display_label: string;
    registry_key: string;
    source_type: string;
    sort_sequence: number;
    version_no: number;
    created_at?: string | null;
    updated_at?: string | null;
    description?: string | null;
  };
}

export interface DeleteValidationRuleDialogProps {
  deletingRule: ValidationRule | null
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface AssignPlanDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
  orgId?: string;
}

export interface TenantActionDialogProps {
  action: { type: TenantActionType; tenant: Tenant } | null
  onClose: () => void
  orgId?: string
  onSuccess?: () => void
}

export interface TenantEventsTableProps {
  tenantId: string;
}

export type TenantActionType = "deactivate" | "activate" | "block" | "unblock" | "expire" | "delete";

export interface FormStep {
  readonly title: string;
  readonly description: string;
  readonly fields: readonly (keyof ExtractionFieldFormValues)[];
}

export type CreatedTenantState = {
  id: string
  orgId: string
  slug: string
}

export type ReplicationOptionKey =
  | "extraction_fields"
  | "extraction_templates"
  | "tenant_configurations"
  | "organisation_configurations"
  | "tenant_profiles"
  | "organisation_profiles";

export type ReplicationSettings = Record<ReplicationOptionKey, boolean>;

export interface SelectorSearchState {
  isMode: boolean;
  query: string;
  items: any[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  normalizedQuery: string;
}

export interface SelectorControlState {
  disabled: boolean;
  readonly: boolean;
  loading: boolean;
  isBulkProcessing: boolean;
}

export interface CategorizedFieldSelectorBodyProps {
  searchState: SelectorSearchState;
  controlState: SelectorControlState;
  sortedCategories: any[];
  selectedIds: string[];
  selectedSet: Set<string>;
  onSelectedChange: (ids: string[]) => void;
  onEdit?: (item: any) => void;
  knownItems: any[];
  loadCategoryItems: any;
  getCategoryItemsQueryKey: any;
  categoryStickyTop: string;
  uncategorizedSelectedItems: any[];
}

export interface ExtractionFieldFormContentProps {
  mode: "create" | "edit"
  fieldId?: string
  onOpenChange: (open: boolean) => void
  onSuccess?: (response?: any, payload?: any) => void
}


export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}



export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon: LucideIcon
}



export interface FieldFormValues {
  field_category_code: string;
  field_label: string;
  short_desc: string;
  field_long_description: string;
  extraction_instructions: string;
  labels: string[];
  examples: string;
  data_type_code: string;
  header_item: string;
  allowed_static_list?: string[];
}



export interface TemplateFieldDialogDetailsStepProps {
  form: UseFormReturn<any>;
  dataTypeOptions: any[];
  fieldCategoryOptions: any[];
  
}



export interface TemplateFieldDialogMeaningStepProps {
  form: UseFormReturn<any>;
}



export interface NavigationFooterProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isPending: boolean;
  onCancel?: () => void;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}



export interface TemplateFieldDialogRulesStepProps {
  form: UseFormReturn<any>;
}



export interface TemplateFieldDialogSidebarProps {
  activeStepIndex: number;
  handleStepChange: (index: number) => void;
  steps: readonly {
    readonly title: string;
    readonly description: string;
    readonly fields: readonly string[];
  }[];
}



export interface SubmitFooterProps {
  isPending: boolean;
  isEditMode: boolean;
  isFormReadyToSubmit: boolean;
  onSubmitClick: () => void;
}



export interface BreadcrumbEntry {
  title: string
  href: string
  isLast: boolean
}

export interface Props {
  breadcrumbs: BreadcrumbEntry[]
}



export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}



export interface CategorizedFieldSelectorProps {
  categories: CategorizedFieldSelectorCategory[];
  selectedIds: string[];
  onSelectedChange: (selectedIds: string[]) => void;
  onSelectAll?: () => Promise<string[]> | string[];
  onDeselectAll?: () => void;
  loadSearchItems?: (
    search: string,
  ) => Promise<CategorizedFieldSelectorLoadResult | CategorizedFieldSelectorItem[]>;
  getSearchItemsQueryKey?: (search: string) => QueryKey;
  loadCategoryItems: (
    category: CategorizedFieldSelectorCategory,
  ) => Promise<CategorizedFieldSelectorLoadResult | CategorizedFieldSelectorItem[]>;
  getCategoryItemsQueryKey: (
    category: CategorizedFieldSelectorCategory,
  ) => QueryKey;
  knownItems?: CategorizedFieldSelectorItem[];
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: React.ReactNode;
  actions?: React.ReactNode;
  panelHeight?: string;
  className?: string;
  onEdit?: (item: CategorizedFieldSelectorItem) => void;
}

export interface SelectorHeaderProps {
  searchId: string;
  search: string;
  setSearch: (val: string) => void;
  searchOptions: SearchOptions;
  bulkOptions: BulkOptions;
  actions?: React.ReactNode;
  isPending: boolean;
}



export interface CopyButtonProps {
  value: string | number
  label: string
}



export interface CopyToClipboardProps {
  value: any
  className?: string
  isLoading?: boolean
  iconSize?: string
  title?: string
}



export interface CopyableFieldProps {
  value: string | number
  label: string
  isSensitive?: boolean
}



export interface FilterProps {
  filter: string;
  onChange: (value: string) => void;
  type: string;
  header: string;
}



export interface ColsConfig {
  default: number
  sm?: number
  lg?: number
}

export interface GridCtx {
  cols: ColsConfig
  total: number
}

export interface DetailGridProps {
  cols?: ColsProp
  children: React.ReactNode
  className?: string
}

export interface DetailGridItemProps {
  label: string
  children: React.ReactNode
  className?: string
  /** injected by DetailGrid — do not pass manually */
  _index?: number
}



export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: React.ReactNode
  description?: React.ReactNode
  containerClassName?: string
  options?: { label: string; value: string | number }[]
  error?: string
  ref?: React.Ref<any>
}



export interface MaskedValueProps {
  value: string | number
}



export interface PaginationComponentProps {
  currentPage: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  enablePagination?: boolean
  className?: string
}



export interface TagInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}



export interface MigrateButtonProps {
  onMigrate: () => void
  isPendingMigrate: boolean
  label?: string
}



export interface RetryButtonProps {
  onRetry: () => void
  isPendingRetry: boolean
  failed?: boolean
  label?: string
}



export interface TenantDatabaseTabProps {
  tenant: Tenant
  onRetry: () => void
  isPendingRetry: boolean
  onMigrate: () => void
  isPendingMigrate: boolean
}



export interface TenantDetailHeaderProps {
  tenant: Tenant
  orgId: string
  onAction: (action: {
    type: "activate" | "deactivate" | "block" | "unblock" | "expire" | "delete" | "assignPlan"
    tenant: Tenant
  }) => void
  onRetry: () => void
  isPendingRetry: boolean
  onMigrate: () => void
  isPendingMigrate: boolean
}



export interface TenantOverviewCardProps {
  tenant: Tenant
  orgId: string
}



export interface TenantOverviewTabProps {
  tenant: Tenant
  onAction: (action: {
    type: "activate" | "deactivate" | "block" | "unblock" | "expire" | "delete" | "assignPlan"
    tenant: Tenant
  }) => void
}



export interface TenantTabsProps {
  tenant: Tenant
  onAction: (action: {
    type:
      | "activate"
      | "deactivate"
      | "block"
      | "unblock"
      | "expire"
      | "delete"
      | "assignPlan"
    tenant: Tenant
  }) => void
  onRetry: () => void
  isPendingRetry: boolean
  onMigrate: () => void
  isPendingMigrate: boolean
}

export type SearchOptions = {
  canSearchFields: boolean;
  isSearchInputDisabled: boolean;
  isSearchMode: boolean;
  isSearchQueryFetching: boolean;
};

export type BulkOptions = {
  onSelectAll?: () => Promise<string[]> | string[];
  isBulkCheckboxDisabled: boolean;
  bulkCheckboxChecked: boolean | "indeterminate";
  allFieldsSelected: boolean;
  handleDeselectAll: () => void;
  handleSelectAll: () => void;
  someFieldsSelected: boolean;
  bulkAction: "select-all" | "deselect-all" | null;
  bulkSelectionLabel: string;
  selectedIdsLength: number;
  totalActiveFieldCount: number;
};

export type ColsShorthand = 2 | 3 | 4 | 6;
export type ColsProp = ColsShorthand | ColsConfig;



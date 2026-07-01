import { Link } from "react-router-dom"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"
import { MaskedValue } from "@/components/ui/copyable-field"
import { EditableValueCell } from "@/pages/organization/components/editable-value-cell"
import { EditableValueCell as ProfileEditableValueCell } from "@/pages/organization/components/profile-editable-value-cell"
import { TenantActionsDropdown } from "@/pages/organization/components/tenant-actions-dropdown"
import { SemanticBadge, type SemanticTone } from "@/components/invoice-ui/design-system"
import {
  MoreVertical,
  Eye,
  Edit,
  Edit2,
  Trash2,
} from "lucide-react"
import type {
  Plan,
  Tenant,
  DataType,
  StandardExtractionFieldResponse,
  FieldCategoryResponse,
  NormalizationRule,
  ValidationRule,
  ReferenceListRegistryResponse,
  ReferenceValueResponse,
  PlatformUser,
  Configuration,
  ProfileEntry,
  TenantActionType,
} from "@/types"
import type { EntityKeyMetadata } from "@/pages/organization/components/use-entity-keys-metadata"

import { StatusBadge } from "@/components/invoice-ui/status-badge"
import { ActiveStatusBadge } from "@/components/invoice-ui/active-status-badge"
import { RoleBadge } from "@/components/invoice-ui/role-badge"

export { StatusBadge } from "@/components/invoice-ui/status-badge"
export { ActiveStatusBadge } from "@/components/invoice-ui/active-status-badge"
export { RoleBadge } from "@/components/invoice-ui/role-badge"

// User role parsing utility
export const getRolesList = (u: PlatformUser | null | undefined): string[] => {
  if (!u) return []
  const raw = Array.isArray(u.roles) ? u.roles : Array.isArray(u.role_names) ? u.role_names : [u.role, u.role_name]
  return raw.reduce<string[]>((acc, r: unknown) => {
    if (r) {
      const name = typeof r === "string" ? r : (r as { name?: string })?.name || ""
      if (name) acc.push(name)
    }
    return acc
  }, [])
}

// 1. Subscription Plans Columns
export const planColumns: CustomColumnDef<Plan>[] = [
  {
    accessorKey: "plan_type",
    header: "Plan Type",
    width: 140,
    cell: ({ row }) => <span className="text-xs font-semibold text-foreground">{row.original.plan_type || "—"}</span>,
  },
   {
    accessorKey: "price_per_invoice_currency",
    header: "Currency",
    width: 100,
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-muted-foreground">
        {row.original.price_per_invoice_currency || "—"}
      </span>
    ),
  },
  {
    accessorKey: "price_per_invoice_amount",
    header: "Price",
    width: 100,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.price_per_invoice_amount ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "plan_interval",
    header: "Interval",
    width: 120,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.plan_interval || "—"}</span>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    width: 100,
    cell: ({ row }) => <ActiveStatusBadge active={row.original.is_active} />,
  },
  {
    accessorKey: "description",
    header: "Description",
    width: 120,
    cell: ({ row }) => <span className="block truncate text-xs text-muted-foreground">{row.original.description || "—"}</span>,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    width: 140,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "N/A"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    width: 80,
    cell: () => {
      return (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-45">
              <DropdownMenuItem disabled className="text-xs cursor-not-allowed opacity-50 gap-1.5">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-xs cursor-not-allowed opacity-50 gap-1.5">
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-xs cursor-not-allowed opacity-50 gap-1.5 text-red-600 focus:text-red-700">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// 2. Tenant list table columns
export const getTenantColumns = (
  orgId: string,
  setTenantAction: (action: { type: TenantActionType; tenant: Tenant } | null) => void
): CustomColumnDef<Tenant>[] => [
  {
    accessorKey: "slug",
    header: "Slug",
    width: "15%",
    minWidth: 100,
    cell: ({ row }) => {
      const slug = row.original.slug || "—"
      return (
        <div className="flex items-center gap-2.5 py-0.5">
          <div className="h-6 w-6 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[10px] leading-none font-semibold flex-shrink-0">
            {getInitials(slug)}
          </div>
          <span className="text-xs font-semibold text-foreground truncate">{slug}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "tenant_role",
    header: "Role",
    width: "15%",
    minWidth: 80,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground capitalize">
        {String(row.original.tenant_role || "").replace(/_/g, " ") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "tenant_admin_full_name",
    header: "Admin",
    width: "20%",
    minWidth: 100,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground truncate">{row.original.tenant_admin_full_name || "—"}</span>
    ),
  },
  {
    accessorKey: "tenant_admin_email",
    header: "Email",
    width: "25%",
    minWidth: 120,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground truncate">{row.original.tenant_admin_email || "—"}</span>
    ),
  },
  {
    accessorKey: "access_status",
    header: "Status",
    width: "15%",
    minWidth: 80,
    cell: ({ row }) => <StatusBadge status={String(row.original.access_status || "inactive")} />,
  },
  {
    id: "actions",
    header: "Actions",
    width: "10%",
    minWidth: 80,
    cell: ({ row }) => (
      <div className="flex justify-start" onClick={(e) => e.stopPropagation()}>
        <TenantActionsDropdown
          tenant={row.original}
          orgId={row.original.organisation_id || orgId}
          setTenantAction={setTenantAction}
        />
      </div>
    ),
  },
]

// 3. Configurations table columns
export const getConfigurationsColumns = (
  isSaving: boolean,
  apiKeysMetadata: Record<string, EntityKeyMetadata>,
  handleValueChange: (key: string, value: string) => void
): CustomColumnDef<Configuration>[] => [
  {
    id: "label",
    header: "Label",
    width: 150,
    cell: ({ row }) => {
      const key = row.original.key
      const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key, description: "" }
      return (
        <span className="text-xs text-foreground">
          {metadata.label}
        </span>
      )
    }
  },
  {
    accessorKey: "key",
    header: "Key",
    width: 150,
    cell: ({ row }) => (
      <span className="text-xs text-foreground">
        {row.original.key}
      </span>
    )
  },
  {
    accessorKey: "value",
    header: "Value",
    width: 200,
    cell: ({ row }) => {
      const isNewRow = (row.original as { isNewRow?: boolean }).isNewRow
      const key = row.original.key
      const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key, description: "" }
      
      if (isNewRow) {
        return (
          <EditableValueCell
            key={`${key}-${(row.original as { dbValue?: string }).dbValue || ""}`}
            configKey={key}
            initialValue={String(row.original.value)}
            isSaving={isSaving}
            isBoolean={metadata.isBoolean}
            referenceKey={metadata.referenceKey}
            onValueChange={handleValueChange}
          />
        )
      }
      
      if (metadata.referenceKey && row.original.value) {
        return (
          <div className="flex items-center">
            <Link
              to={`/platform-standard-content/reference-lists/${metadata.referenceKey}/${row.original.value}`}
              className="text-xs font-semibold text-foreground hover:underline bg-muted/50 hover:bg-muted px-2 py-0.5 rounded border border-border transition-colors cursor-pointer text-left"
              title="Click to view reference item details"
            >
              {String(row.original.value)}
            </Link>
          </div>
        )
      }
      
      return <MaskedValue value={String(row.original.value)} />
    }
  },
]

// 4. Profile table columns
export const getProfileColumns = (
  isSaving: boolean,
  apiKeysMetadata: Record<string, EntityKeyMetadata>,
  handleValueChange: (key: string, value: string) => void
): CustomColumnDef<ProfileEntry>[] => [
  {
    accessorKey: "key",
    header: "Key",
    width: 150,
    cell: ({ row }) => (
      <span className="text-xs text-foreground">
        {row.original.key}
      </span>
    )
  },
  {
    id: "label",
    header: "Label",
    width: 150,
    cell: ({ row }) => {
      const key = row.original.key
      const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key, description: "" }
      return (
        <span className="text-xs text-foreground">
          {metadata.label}
        </span>
      )
    }
  },
  {
    accessorKey: "value",
    header: "Value",
    width: 200,
    cell: ({ row }) => {
      const key = row.original.key
      const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key, description: "" }
      
      return (
        <ProfileEditableValueCell
          key={`${key}-${(row.original as { dbValue?: string }).dbValue || ""}`}
          configKey={key}
          initialValue={String(row.original.value)}
          isSaving={isSaving}
          isBoolean={metadata.isBoolean}
          referenceKey={metadata.referenceKey}
          onValueChange={handleValueChange}
        />
      )
    }
  },
]

// 5. Data Types columns
export const getDataTypeColumns = (
  navigate: (path: string) => void,
  setEditingDataType: (dt: DataType) => void
): CustomColumnDef<DataType>[] => [
  {
    accessorKey: "data_type_code",
    header: "Code",
    width: 130,
    cell: ({ row }) => (
      <span className=" text-xs font-semibold text-foreground">
        {row.original.data_type_code || "—"}
      </span>
    ),
  },
  {
    accessorKey: "display_label",
    header: "Display Label",
    width: 130,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.display_label || "—"}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    width: 180,
    rowClassName: "hidden md:table-cell",
    cell: ({ row }) => (
      <span
        className="block max-w-[170px] truncate text-xs text-muted-foreground"
        title={row.original.description || "—"}
      >
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "sample_value",
    header: "Sample Value",
    width: 120,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="block max-w-[110px] truncate  text-xs text-muted-foreground">
        {row.original.sample_value || "—"}
      </span>
    ),
  },
  {
    accessorKey: "sort_sequence",
    header: "Sort Sequence",
    width: 60,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.sort_sequence ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    width: 100,
    rowClassName: "hidden md:table-cell",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    width: 60,
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 cursor-pointer p-0"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={() => navigate(`/platform-standard-content/data-types/${row.original.data_type_code}`)}
            >
              <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={() => setEditingDataType(row.original)}
            >
              <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]


// 7. Extraction Fields table columns
export const getFieldsTableColumns = (
  onEdit: (field: StandardExtractionFieldResponse) => void,
  onView?: (field: StandardExtractionFieldResponse) => void
): CustomColumnDef<StandardExtractionFieldResponse>[] => [
  {
    accessorKey: "field_id",
    header: "Field ID",
    width: "20%",
    minWidth: "120px",
    cell: ({ row }) => <span className=" text-xs font-semibold text-foreground truncate block">{row.original.field_id || "—"}</span>,
  },
  {
    accessorKey: "field_label",
    header: "Label",
    width: "20%",
    minWidth: "130px",
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.field_label || "—"}</span>,
  },
  {
    accessorKey: "data_type_code",
    header: "Type",
    width: "120px",
    minWidth: "100px",
    cell: ({ row }) => (
      <SemanticBadge tone="neutral" className="">
        {row.original.data_type_code || "—"}
      </SemanticBadge>
    ),
  },
  {
    accessorKey: "field_category_code",
    header: "Category",
    width: "150px",
    minWidth: "120px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground truncate block">{row.original.field_category_code || "—"}</span>,
  },
  {
    accessorKey: "header_item",
    header: "Scope",
    width: "100px",
    minWidth: "80px",
    cell: ({ row }) => {
      const isHeader = row.original.header_item === "header";
      return (
        <SemanticBadge tone={isHeader ? "accent" : "info"} className="capitalize">
          {row.original.header_item || "—"}
        </SemanticBadge>
      );
    },
  },
  {
    accessorKey: "allowed_value_mode",
    header: "Value Mode",
    width: "130px",
    minWidth: "110px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground capitalize">{(row.original.allowed_value_mode || "—").replace("_", " ")}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    width: "80px",
    minWidth: "80px",
    cell: ({ row }) => (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 cursor-pointer p-0"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={() => onView && onView(row.original)}
            >
              <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              View 
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={() => onEdit(row.original)}
            >
              <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    ),
  },
]

// 8. Field Categories table columns
export const getFieldCategoriesColumns = (
  navigate: (path: string) => void,
  handleOpenEdit: (category: FieldCategoryResponse) => void
): CustomColumnDef<FieldCategoryResponse>[] => [
  {
    accessorKey: "field_category_code",
    header: "Category Code",
    width: "25%",
    minWidth: "150px",
    cell: ({ row }) => <span className=" text-xs font-semibold text-slate-700">{row.original.field_category_code || "—"}</span>,
  },
  {
    accessorKey: "ui_label",
    header: "UI Label",
    width: "25%",
    minWidth: "150px",
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.ui_label || "—"}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
    width: "50%",
    minWidth: "250px",
    cell: ({ row }) => (
      <span className="block truncate text-xs text-muted-foreground max-w-[450px]" title={row.original.description || "—"}>
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "example_fields",
    header: "Fields",
    width: "100px",
    minWidth: "90px",
    maxWidth: "110px",
    cell: ({ row }) => {
      const count = row.original.example_fields?.length || 0
      return (
        <SemanticBadge tone="accent">
          {count} {count === 1 ? "Field" : "Fields"}
        </SemanticBadge>
      )
    },
  },
  {
    accessorKey: "sort_sequence",
    header: "Sort",
    width: "80px",
    minWidth: "70px",
    maxWidth: "80px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground font-semibold">{row.original.sort_sequence ?? "—"}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    width: "80px",
    minWidth: "80px",
    maxWidth: "80px",
    cell: ({ row }) => (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => navigate(`/platform-standard-content/field-categories/${row.original.field_category_code}`)}>
              <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => handleOpenEdit(row.original)}>
              <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// 9. Normalization Rules table columns
export const getNormalizationRuleColumns = (
  navigate: (path: string) => void,
  setEditingRule: (r: NormalizationRule) => void,
  setDeletingRule: (r: NormalizationRule) => void
): CustomColumnDef<NormalizationRule>[] => [
  {
    accessorKey: "rule_code",
    header: "Code",
    width: 120,
    cell: ({ row }) => (
      <span className=" text-xs font-semibold text-foreground">
        {row.original.rule_code || "—"}
      </span>
    ),
  },
  {
    accessorKey: "display_label",
    header: "Display Label",
    width: 140,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.display_label || "—"}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    width: 180,
    rowClassName: "hidden md:table-cell",
    cell: ({ row }) => (
      <span
        className="block max-w-[170px] truncate text-xs text-muted-foreground"
        title={row.original.description || "—"}
      >
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "rule_mode",
    header: "Mode",
    width: 100,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="text-xs text-foreground">
        {row.original.rule_mode || "DECLARATIVE"}
      </span>
    ),
  },
  {
    accessorKey: "engine_type",
    header: "Engine Type",
    width: 110,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
  <span className="text-xs text-muted-foreground">
    {row.original.engine_type || "-"}
  </span>
),
  },
  {
    accessorKey: "sort_sequence",
    header: "Sort Sequence",
    width: 80,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.sort_sequence ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    width: 90,
    cell: ({ row }) => <ActiveStatusBadge active={row.original.is_active} className="text-xxs px-2 py-0.5 font-semibold" />,
  },
  {
    id: "actions",
    header: "Action",
    width: 70,
    cell: ({ row }) => (
      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45 text-xs-fine">
            <DropdownMenuItem
              onClick={() => navigate(`/platform-standard-content/normalization-rules/${row.original.rule_code}`)}
              className="cursor-pointer gap-1.5"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setEditingRule(row.original)}
              className="cursor-pointer gap-1.5"
            >
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeletingRule(row.original)}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// 10. Validation Rules table columns
export const getValidationRuleColumns = (
  navigate: (path: string) => void,
  setEditingRule: (r: ValidationRule) => void,
  setDeletingRule: (r: ValidationRule) => void
): CustomColumnDef<ValidationRule>[] => [
  {
    accessorKey: "rule_code",
    header: "Code",
    width: 120,
    cell: ({ row }) => (
      <span className=" text-xs font-semibold text-foreground">
        {row.original.rule_code}
      </span>
    ),
  },
  {
    accessorKey: "display_label",
    header: "Display Label",
    width: 140,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.display_label}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    width: 180,
    rowClassName: "hidden md:table-cell",
    cell: ({ row }) => (
      <span
        className="block max-w-[170px] truncate text-xs text-muted-foreground"
        title={row.original.description || "—"}
      >
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "rule_mode",
    header: "Mode",
    width: 100,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="text-xs text-foreground ">
        {row.original.rule_mode || "DECLARATIVE"}
      </span>
    ),
  },
  {
    accessorKey: "engine_type",
    header: "Engine Type",
    width: 110,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground ">
        {row.original.engine_type || "—"}
      </span>
    ),
  },
  {
    accessorKey: "sort_sequence",
    header: "Sort Sequence",
    width: 80,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.sort_sequence ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    width: 90,
    cell: ({ row }) => <ActiveStatusBadge active={row.original.is_active} className="text-xxs px-2 py-0.5 font-semibold" />,
  },
  {
    id: "actions",
    header: "Action",
    width: 70,
    cell: ({ row }) => (
      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45 text-xs-fine">
            <DropdownMenuItem
              onClick={() => navigate(`/platform-standard-content/validation-rules/${row.original.rule_code}`)}
              className="cursor-pointer gap-1.5"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setEditingRule(row.original)}
              className="cursor-pointer gap-1.5"
            >
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeletingRule(row.original)}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// 11. Reference Lists table columns
export const getReferenceListsColumns = (
  navigate: (path: string) => void,
  handleOpenEdit: (registry: ReferenceListRegistryResponse) => void
): CustomColumnDef<ReferenceListRegistryResponse>[] => [
  {
    accessorKey: "registry_key",
    header: "Registry Key",
    width: 220,
    minWidth: 150,
    cell: ({ row }) => (
      <span className=" text-xs font-semibold text-foreground truncate block">
        {row.original.registry_key || "—"}
      </span>
    ),
  },
  {
    accessorKey: "display_label",
    header: "Display Label",
    width: 220,
    minWidth: 150,
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.display_label || "—"}</span>,
  },
  {
    accessorKey: "source_type",
    header: "Source",
    width: 120,
    minWidth: 100,
    cell: ({ row }) => {
      const type = row.original.source_type || "custom"
      const tone: SemanticTone = type === "system" ? "info" : type === "standard" ? "accent" : "neutral"
      return (
        <SemanticBadge tone={tone} className="capitalize">
          {type}
        </SemanticBadge>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    width: 320,
    minWidth: 200,
    cell: ({ row }) => (
      <span className="block truncate text-xs text-muted-foreground max-w-[450px]" title={row.original.description || ""}>
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "sort_sequence",
    header: "Sort",
    width: 100,
    minWidth: 80,
    cell: ({ row }) => <span className="text-xs text-muted-foreground font-semibold">{row.original.sort_sequence ?? "—"}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    width: 80,
    minWidth: 80,
    cell: ({ row }) => (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => navigate(`/platform-standard-content/reference-lists/${row.original.registry_key}`)}>
              <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => handleOpenEdit(row.original)}>
              <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// 12. Reference List Details table columns
export const getReferenceListDetailsColumns = (
  navigate: (path: string) => void,
  registryKey: string,
  handleOpenEdit: (val: ReferenceValueResponse) => void
): CustomColumnDef<ReferenceValueResponse>[] => [
  {
    accessorKey: "value_code",
    header: "Value Code",
    width: 220,
    minWidth: 130,
    cell: ({ row }) => (
      <span className=" text-xs font-semibold text-foreground truncate block">
        {row.original.value_code || "—"}
      </span>
    ),
  },
  {
    accessorKey: "value_label",
    header: "Display Label",
    width: 220,
    minWidth: 150,
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.value_label || "—"}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
    width: 320,
    minWidth: 200,
    cell: ({ row }) => (
      <span className="block truncate text-xs text-muted-foreground max-w-[350px]" title={row.original.description || ""}>
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "attributes",
    header: "Attributes",
    width: 150,
    minWidth: 120,
    cell: ({ row }) => {
      if (!row.original.attributes) return <span className="text-xs text-muted-foreground">—</span>
      const keys = Object.keys(row.original.attributes)
      const count = keys.length
      if (count === 0) return <span className="text-xs text-muted-foreground">—</span>
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0" title={`${count} attributes`}>
            {count}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "sort_sequence",
    header: "Sort",
    width: 100,
    minWidth: 80,
    cell: ({ row }) => <span className="text-xs text-muted-foreground font-semibold">{row.original.sort_sequence ?? "—"}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    width: 80,
    minWidth: 80,
    cell: ({ row }) => (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => navigate(`/platform-standard-content/reference-lists/${registryKey}/${row.original.value_code}`)}>
              <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => handleOpenEdit(row.original)}>
              <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// 13. Tenant Events Audit Table columns
export const tenantEventsTableColumns: CustomColumnDef<any>[] = [
  {
    accessorKey: "event_type",
    header: "Event Type",
    width: "25%",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-foreground ">
        {row.original.event_type || row.original.type || "Unknown"}
      </span>
    ),
  },
  {
    accessorKey: "message",
    header: "Message",
    width: "45%",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.message || row.original.detail || "-"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    width: "15%",
    cell: ({ row }) => <ActiveStatusBadge status={row.original.status || "Completed"} />,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    width: "15%",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.created_at || row.original.timestamp
          ? new Date(row.original.created_at || row.original.timestamp).toLocaleDateString()
          : "N/A"}
      </span>
    ),
  },
]

// 14. Platform Users columns
export const getUsersColumns = (
  navigate: (path: string) => void,
  handleOpenEditDialog: (user: PlatformUser) => void
): CustomColumnDef<PlatformUser>[] => [
  {
    accessorKey: "name",
    header: "Name",
    width: "28%",
    minWidth: "220px",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
         <div className="h-6 w-6 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[10px] leading-none font-semibold flex-shrink-0 uppercase">
          {getInitials(row.original.full_name) || "U"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{row.original.full_name || "—"}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    width: "30%",
    minWidth: "220px",
    cell: ({ row }) => <span className="block truncate text-xs text-muted-foreground">{row.original.email || "—"}</span>,
  },
  {
    accessorKey: "roles",
    header: "Role(s)",
    width: "22%",
    minWidth: "180px",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        {getRolesList(row.original).map((role) => <RoleBadge key={role} role={role} />)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    width: "140px",
    minWidth: "140px",
    rowClassName: "w-40",
    cell: ({ row }) => <ActiveStatusBadge status={row.original.status || "ACTIVE"} />,
  },
  {
    id: "actions",
    header: "Actions",
    width: "88px",
    minWidth: "88px",
    cell: ({ row }) => (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuItem className="text-xs cursor-pointer gap-1.5" onClick={() => navigate(`/users/${row.original.id}`)}>
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs cursor-pointer gap-1.5" onClick={() => handleOpenEditDialog(row.original)}>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-xs cursor-not-allowed opacity-50 gap-1.5 text-red-600 focus:text-red-600">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

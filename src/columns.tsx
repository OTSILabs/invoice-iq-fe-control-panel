import { Link } from "react-router-dom"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, getInitials } from "@/lib/utils"
import { MaskedValue } from "@/components/ui/copyable-field"
import { EditableValueCell } from "@/pages/organization/components/editable-value-cell"
import { EditableValueCell as ProfileEditableValueCell } from "@/pages/organization/components/profile-editable-value-cell"
import { TenantActionsDropdown } from "@/pages/organization/modals/tenant-actions-dropdown"
import {
  MoreVertical,
  Eye,
  Edit,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react"
import type {
  Plan,
  Tenant,
  DataType,
  StandardDerivedTemplateResponse,
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

// Shared Tenant Status Badge
type StatusKey = "active" | "inactive" | "blocked" | "expired" | "pending" | "warning"

const STATUS_CFG: Record<StatusKey, { label: string; dot: string; badge: string }> = {
  active: { label: "Active", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" },
  inactive: { label: "Inactive", dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground border-border" },
  blocked: { label: "Blocked", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800" },
  expired: { label: "Expired", dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800" },
  pending: { label: "Pending", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800" },
  warning: { label: "Warning", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40" },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status.toLowerCase() as StatusKey] || STATUS_CFG.inactive
  return (
    <Badge variant="outline" className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xxs font-semibold", cfg.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </Badge>
  )
}

export function ActiveStatusBadge({
  status,
  active,
  color,
  className
}: {
  status?: string | null
  active?: boolean | null
  color?: "green" | "blue" | "red" | "yellow" | "gray" | "rose"
  className?: string
}) {
  const normalized = status ? status.toLowerCase().trim() : (active ?? true ? "active" : "inactive")
  
  let key: StatusKey = "inactive"
  if (color) {
    key = color === "green"
      ? "active"
      : color === "blue"
      ? "pending"
      : color === "red"
      ? "blocked"
      : color === "yellow"
      ? "warning"
      : color === "rose"
      ? "expired"
      : "inactive"
  } else {
    key = ["success", "active", "complete", "completed"].includes(normalized)
      ? "active"
      : ["blocked", "deactivated", "failed"].includes(normalized)
      ? "blocked"
      : ["expired"].includes(normalized)
      ? "expired"
      : ["in_progress", "inprogress"].includes(normalized)
      ? "pending"
      : ["pending"].includes(normalized)
      ? "warning"
      : "inactive"
  }

  const displayLabel = status || (key === "active" ? "Active" : "Inactive")
  const cfg = STATUS_CFG[key] || STATUS_CFG.inactive

  return (
    <Badge
      variant={key === "active" ? "secondary" : "outline"}
      className={cn(
        "text-xxs px-2 py-0.5 font-semibold",
        cfg.badge,
        className
      )}
    >
      {displayLabel}
    </Badge>
  )
}

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

const getRoleBadgeVariant = (role: string) => {
  const r = role?.toLowerCase()
  const base = "font-semibold text-[10px] px-1.5 py-0.5"
  if (r === "admin") return { variant: "outline" as const, className: `${base} border-primary text-primary` }
  if (r === "user" || r === "standard user") return { variant: "secondary" as const, className: `${base} bg-slate-100 text-foreground hover:bg-slate-200` }
  return { variant: "outline" as const, className: base }
}

// 1. Subscription Plans Columns
export const planColumns: CustomColumnDef<Plan>[] = [
  {
    accessorKey: "plan_type",
    header: "Plan Type",
    width: 140,
    cell: ({ row }) => <span className="text-xs font-semibold text-foreground">{row.original.plan_type}</span>,
  },
  {
    accessorKey: "price_per_invoice_amount",
    header: "Price",
    width: 140,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.price_per_invoice_currency} {row.original.price_per_invoice_amount}
      </span>
    ),
  },
  {
    accessorKey: "plan_interval",
    header: "Interval",
    width: 120,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.plan_interval}</span>,
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
    cell: ({ row }) => <span className="block truncate text-xs text-muted-foreground">{row.original.description}</span>,
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
      <span className="font-mono text-xs font-semibold text-foreground">
        {row.original.data_type_code}
      </span>
    ),
  },
  {
    accessorKey: "display_label",
    header: "Display Label",
    width: 130,
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
        title={row.original.description}
      >
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "sample_value",
    header: "Sample Value",
    width: 120,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="block max-w-[110px] truncate font-mono text-xs text-muted-foreground">
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

// 6. Derived Templates table columns
export const getDerivedTableColumns = (
  onDelete: (id: string) => void
): CustomColumnDef<StandardDerivedTemplateResponse>[] => [
  {
    accessorKey: "derived_template_id",
    header: "Derived ID",
    width: "25%",
    minWidth: "140px",
    cell: ({ row }) => <span className=" text-xs font-semibold text-foreground truncate block">{row.original.derived_template_id}</span>,
  },
  {
    accessorKey: "template_id",
    header: "Base Template ID",
    width: "20%",
    minWidth: "120px",
    cell: ({ row }) => <span className=" text-xs text-muted-foreground truncate block">{row.original.template_id}</span>,
  },
  {
    accessorKey: "name",
    header: "Name",
    width: "25%",
    minWidth: "150px",
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.name}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
    width: "25%",
    minWidth: "200px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground truncate block max-w-[300px]">{row.original.description || "—"}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    width: "100px",
    minWidth: "100px",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
              <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-45">
            <DropdownMenuItem asChild className="text-xs cursor-pointer">
              <Link to={`/platform-standard-content/extraction-management/derived/${row.original.derived_template_id}/edit`}>
                <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-red-600 cursor-pointer focus:text-red-700" onClick={() => onDelete(row.original.derived_template_id)}>
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// 7. Extraction Fields table columns
export const getFieldsTableColumns = (
  onEdit: (field: StandardExtractionFieldResponse) => void
): CustomColumnDef<StandardExtractionFieldResponse>[] => [
  {
    accessorKey: "field_id",
    header: "Field ID",
    width: "20%",
    minWidth: "120px",
    cell: ({ row }) => <span className="font-mono text-xs font-semibold text-foreground truncate block">{row.original.field_id}</span>,
  },
  {
    accessorKey: "field_label",
    header: "Label",
    width: "20%",
    minWidth: "130px",
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.field_label}</span>,
  },
  {
    accessorKey: "data_type_code",
    header: "Type",
    width: "120px",
    minWidth: "100px",
    cell: ({ row }) => <Badge variant="outline" className="text-[10px] uppercase font-bold">{row.original.data_type_code}</Badge>,
  },
  {
    accessorKey: "field_category_code",
    header: "Category",
    width: "150px",
    minWidth: "120px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground truncate block">{row.original.field_category_code}</span>,
  },
  {
    accessorKey: "header_item",
    header: "Scope",
    width: "100px",
    minWidth: "80px",
    cell: ({ row }) => {
      const isHeader = row.original.header_item === "header";
      return (
        <Badge variant={isHeader ? "secondary" : "outline"} className={cn("text-[9px] font-semibold px-2 py-0.5 capitalize", isHeader ? "bg-slate-50 text-slate-700 border-slate-200" : "bg-blue-50/50 text-blue-700 border-blue-200")}>
          {row.original.header_item}
        </Badge>
      );
    },
  },
  {
    accessorKey: "allowed_value_mode",
    header: "Value Mode",
    width: "130px",
    minWidth: "110px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground capitalize">{row.original.allowed_value_mode.replace("_", " ")}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    width: "80px",
    minWidth: "80px",
    cell: ({ row }) => (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer" onClick={() => onEdit(row.original)}>
          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
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
    cell: ({ row }) => <span className="font-mono text-xs font-semibold text-slate-700">{row.original.field_category_code}</span>,
  },
  {
    accessorKey: "ui_label",
    header: "UI Label",
    width: "25%",
    minWidth: "150px",
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.ui_label}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
    width: "50%",
    minWidth: "250px",
    cell: ({ row }) => (
      <span className="block truncate text-xs text-muted-foreground max-w-[450px]" title={row.original.description}>
        {row.original.description}
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
        <Badge variant="secondary" className="text-[11px] px-2 py-0.5 font-semibold bg-slate-100 text-slate-700 hover:bg-slate-100">
          {count} {count === 1 ? "Field" : "Fields"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "sort_sequence",
    header: "Sort",
    width: "80px",
    minWidth: "70px",
    maxWidth: "80px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground font-semibold">{row.original.sort_sequence}</span>,
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
      <span className="font-mono text-xs font-semibold text-foreground">
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
        title={row.original.description}
      >
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "rule_mode",
    header: "Mode",
    width: 100,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="text-xs text-foreground font-mono uppercase">
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
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.engine_type}
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
      <span className="font-mono text-xs font-semibold text-foreground">
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
        title={row.original.description}
      >
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "rule_mode",
    header: "Mode",
    width: 100,
    rowClassName: "hidden lg:table-cell",
    cell: ({ row }) => (
      <span className="text-xs text-foreground font-mono uppercase">
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
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.engine_type}
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
    width: "25%",
    minWidth: "150px",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-foreground truncate block">
        {row.original.registry_key}
      </span>
    ),
  },
  {
    accessorKey: "display_label",
    header: "Display Label",
    width: "25%",
    minWidth: "150px",
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.display_label}</span>,
  },
  {
    accessorKey: "source_type",
    header: "Source",
    width: "100px",
    minWidth: "90px",
    maxWidth: "100px",
    cell: ({ row }) => {
      const type = row.original.source_type || "custom"
      const variant = type === "system" ? "default" : type === "standard" ? "secondary" : "outline"
      return (
        <Badge variant={variant} className="text-[10px] px-2 py-0.5 capitalize font-semibold">
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    width: "40%",
    minWidth: "200px",
    cell: ({ row }) => (
      <span className="block truncate text-xs text-muted-foreground max-w-[450px]" title={row.original.description || ""}>
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "sort_sequence",
    header: "Sort",
    width: "70px",
    minWidth: "60px",
    maxWidth: "70px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground font-semibold">{row.original.sort_sequence}</span>,
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
    width: "25%",
    minWidth: "130px",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-foreground truncate block">
        {row.original.value_code}
      </span>
    ),
  },
  {
    accessorKey: "value_label",
    header: "Display Label",
    width: "25%",
    minWidth: "150px",
    cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.value_label}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
    width: "30%",
    minWidth: "200px",
    cell: ({ row }) => (
      <span className="block truncate text-xs text-muted-foreground max-w-[350px]" title={row.original.description || ""}>
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "attributes",
    header: "Attributes",
    width: "150px",
    minWidth: "120px",
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
    width: "70px",
    minWidth: "60px",
    maxWidth: "70px",
    cell: ({ row }) => <span className="text-xs text-muted-foreground font-semibold">{row.original.sort_sequence}</span>,
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
      <span className="text-xs font-semibold text-foreground font-mono">
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
        <Avatar className="h-8 w-8 rounded-md border bg-background">
          <AvatarFallback className="rounded-md bg-primary/8 text-[11px] font-semibold text-primary uppercase">
            {getInitials(row.original.full_name) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{row.original.full_name}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    width: "30%",
    minWidth: "220px",
    cell: ({ row }) => <span className="block truncate text-xs text-muted-foreground">{row.original.email}</span>,
  },
  {
    accessorKey: "roles",
    header: "Role(s)",
    width: "22%",
    minWidth: "180px",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        {getRolesList(row.original).map((role) => {
          const badge = getRoleBadgeVariant(role)
          return (
            <Badge key={role} variant={badge.variant} className={badge.className}>
              {String(role).toUpperCase()}
            </Badge>
          )
        })}
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

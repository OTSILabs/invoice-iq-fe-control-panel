import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import type { Tenant, OrganizationTenantsTabProps, TenantActionType } from "@/types";
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { TenantActionDialog } from "@/pages/tenants/tenant-actions/tenant-action-dialog"
import { useOrganizationTenants } from "@/api/hooks/useOrganizations"
import { getInitials } from "@/lib/utils"
import { TenantActionsDropdown } from "../modals/tenant-actions-dropdown"

type StatusKey = "active" | "inactive" | "blocked" | "expired" | "pending"

const STATUS_CFG: Record<StatusKey, { label: string; dot: string; badge: string }> = {
  active: { label: "Active", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" },
  inactive: { label: "Inactive", dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground border-border" },
  blocked: { label: "Blocked", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800" },
  expired: { label: "Expired", dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800" },
  pending: { label: "Pending", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800" },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status.toLowerCase() as StatusKey] || STATUS_CFG.inactive
  return (
    <Badge variant="outline" className={`text-[11px] px-2 py-0.5 font-medium border inline-flex items-center gap-1.5 ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </Badge>
  )
}





export function OrganizationTenantsTab({ orgId, organizationName }: OrganizationTenantsTabProps) {
  const navigate = useNavigate()
  const [tenantAction, setTenantAction] = useState<{ type: TenantActionType; tenant: Tenant } | null>(null)
  const { data: tenants = [], isLoading } = useOrganizationTenants(orgId)

  const columns = useMemo<CustomColumnDef<Tenant>[]>(() => [
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
          <TenantActionsDropdown tenant={row.original} orgId={orgId} setTenantAction={setTenantAction} />
        </div>
      ),
    },
  ], [orgId])



  return (
    <>
      <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tenants</h3>
              <p className="text-[12px] text-muted-foreground">Manage tenants for this organization.</p>
            </div>
          </div>
          <CreateOrganizationModal existingOrganization={{ id: orgId, name: organizationName }}>
            <Button variant="outline" size="sm" className="text-xs shadow-none">
              <Plus className="size-3.5 mr-1.5" /> Add Tenant
            </Button>
          </CreateOrganizationModal>
        </div>

        {/* Table */}
        <DataTable
          data={tenants}
          columns={columns}
          isLoading={isLoading}
          enablePagination
          pageSize={5}
          totalItems={tenants.length}
          stickyHeader
          tableContainerClassName="border-0 rounded-none bg-transparent"
          onRowClick={(tenant) => navigate(`/organizations/${orgId}/tenants/${tenant.id}`)}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-foreground mb-1">No tenants yet</p>
              <p className="text-xs text-muted-foreground mb-4">Add a tenant to get started with this organization.</p>
              <CreateOrganizationModal existingOrganization={{ id: orgId, name: organizationName }}>
                <Button variant="outline" size="sm" className="text-xs shadow-none gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add tenant
                </Button>
              </CreateOrganizationModal>
            </div>
          }
        />
      </div>

      <TenantActionDialog action={tenantAction} onClose={() => setTenantAction(null)} orgId={orgId} />
    </>
  )
}

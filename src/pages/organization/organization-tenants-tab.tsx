import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { organizationsService } from "@/api/services/organizations.service"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import type { Tenant } from "@/types"
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { TenantActionsDropdown } from "./tenant-actions-dropdown"
import { ActivateTenantDialog } from "@/pages/tenants/tenant-actions/activate-tenant-dialog"
import { DeactivateTenantDialog } from "@/pages/tenants/tenant-actions/deactivate-tenant-dialog"
import { BlockTenantDialog } from "@/pages/tenants/tenant-actions/block-tenant-dialog"
import { UnblockTenantDialog } from "@/pages/tenants/tenant-actions/unblock-tenant-dialog"
import { ExpireTenantDialog } from "@/pages/tenants/tenant-actions/expire-tenant-dialog"
import { DeleteTenantDialog } from "@/pages/tenants/tenant-actions/delete-tenant-dialog"
import { cn } from "@/lib/utils"

interface OrganizationTenantsTabProps {
  orgId: string
  organizationName: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

type StatusKey = "active" | "inactive" | "blocked" | "expired" | "pending"

const STATUS_CFG: Record<StatusKey, { label: string; dot: string; badge: string }> = {
  active:   {
    label: "Active",
    dot:   "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  },
  inactive: {
    label: "Inactive",
    dot:   "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
  blocked:  {
    label: "Blocked",
    dot:   "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
  },
  expired:  {
    label: "Expired",
    dot:   "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800",
  },
  pending:  {
    label: "Pending",
    dot:   "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
  },
}

function StatusBadge({ status }: { status: string }) {
  const key = (status.toLowerCase() as StatusKey)
  const cfg = STATUS_CFG[key] ?? STATUS_CFG.inactive
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] px-2 py-0.5 font-medium border inline-flex items-center gap-1.5", cfg.badge)}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      {cfg.label}
    </Badge>
  )
}

export function OrganizationTenantsTab({ orgId, organizationName }: OrganizationTenantsTabProps) {
  const [tenantAction, setTenantAction] = useState<{
    type: "deactivate" | "activate" | "block" | "unblock" | "expire" | "delete"
    tenant: Tenant
  } | null>(null)

  const { data: tenants = [], isLoading: isTenantsLoading } = useQuery({
    queryKey: ["organizations", orgId, "tenants"],
    queryFn:  () => organizationsService.getTenants(orgId),
    enabled:  !!orgId,
  })

  const tenantList   = Array.isArray(tenants) ? tenants : []
  const activeCount  = tenantList.filter(t => String(t.access_status).toLowerCase() === "active").length
  const blockedCount = tenantList.filter(t => String(t.access_status).toLowerCase() === "blocked").length
  const expiredCount = tenantList.filter(t => String(t.access_status).toLowerCase() === "expired").length

  const columns = useMemo<CustomColumnDef<Tenant>[]>(() => [
    {
      accessorKey: "tenant_admin_full_name",
      header: "Admin",
      width: 300,
      cell: ({ row }) => {
        const name = row.original.tenant_admin_full_name || "Unknown"
        return (
          <div className="flex items-center gap-2.5 py-0.5">
            <div className="h-6 w-6 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[10px] leading-none font-semibold flex-shrink-0">
              {getInitials(name)}
            </div>
            <span className="text-xs font-medium text-foreground truncate">{name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "tenant_role",
      header: "Role",
      width: 150,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground capitalize">
          {String(row.original.tenant_role || "").replace(/_/g, " ") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "access_status",
      header: "Status",
      width: 150,
      cell: ({ row }) => (
        <StatusBadge status={String(row.original.access_status || "inactive")} />
      ),
    },
    {
      id: "actions",
      header: "",
      width: "auto",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <TenantActionsDropdown
            tenant={row.original}
            orgId={orgId}
            setTenantAction={setTenantAction}
          />
        </div>
      ),
    },
  ], [orgId])

  return (
    <>
      <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-card">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Tenants</p>

            {!isTenantsLoading && tenantList.length > 0 && (
              <div className="flex items-center gap-2">
                {/* total */}
                <span className="text-[11px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                  {tenantList.length} total
                </span>
                {/* active */}
                {activeCount > 0 && (
                  <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                    {activeCount} active
                  </span>
                )}
                {/* blocked */}
                {blockedCount > 0 && (
                  <span className="text-[11px] font-medium bg-red-50 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800 px-2 py-0.5 rounded-full">
                    {blockedCount} blocked
                  </span>
                )}
                {/* expired */}
                {expiredCount > 0 && (
                  <span className="text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800 px-2 py-0.5 rounded-full">
                    {expiredCount} expired
                  </span>
                )}
              </div>
            )}
          </div>

          <CreateOrganizationModal existingOrganization={{ id: orgId, name: organizationName }}>
            <Button variant="outline" size="sm" className="h-7 text-xs shadow-none gap-1 font-medium">
              <Plus className="h-3.5 w-3.5" /> Add tenant
            </Button>
          </CreateOrganizationModal>
        </div>

        {/* ── Table ── */}
        <DataTable
          data={tenantList}
          columns={columns}
          isLoading={isTenantsLoading}
          enablePagination
          pageSize={5}
          totalItems={tenantList.length}
          stickyHeader
          tableContainerClassName="border-0 rounded-none bg-transparent"
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-foreground mb-1">No tenants yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Add a tenant to get started with this organization.
              </p>
              <CreateOrganizationModal existingOrganization={{ id: orgId, name: organizationName }}>
                <Button variant="outline" size="sm" className="text-xs shadow-none gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add tenant
                </Button>
              </CreateOrganizationModal>
            </div>
          }
        />
      </div>

      <ActivateTenantDialog   tenant={tenantAction?.type === "activate"   ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <DeactivateTenantDialog tenant={tenantAction?.type === "deactivate" ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <BlockTenantDialog      tenant={tenantAction?.type === "block"      ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <UnblockTenantDialog    tenant={tenantAction?.type === "unblock"    ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <ExpireTenantDialog     tenant={tenantAction?.type === "expire"     ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <DeleteTenantDialog     tenant={tenantAction?.type === "delete"     ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
    </>
  )
}

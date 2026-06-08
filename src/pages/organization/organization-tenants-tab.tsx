import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Users, Plus } from "lucide-react"
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

interface OrganizationTenantsTabProps {
  orgId: string;
  organizationName: string;
}

export function OrganizationTenantsTab({ orgId, organizationName }: OrganizationTenantsTabProps) {
  const [tenantAction, setTenantAction] = useState<{ type: "deactivate" | "activate" | "block" | "unblock" | "expire" | "delete", tenant: Tenant } | null>(null)

  const { data: tenants = [], isLoading: isTenantsLoading } = useQuery({
    queryKey: ['organizations', orgId, 'tenants'],
    queryFn: () => organizationsService.getTenants(orgId),
    enabled: !!orgId
  })

  const columns = useMemo<CustomColumnDef<Tenant>[]>(() => [
    {
      accessorKey: "tenant_admin_full_name",
      header: "Admin Name",
      width: 180,
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground">
          {row.original.tenant_admin_full_name || "N/A"}
        </span>
      )
    },
    {
      accessorKey: "tenant_role",
      header: "Role",
      width: 120,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground capitalize">
          {String(row.original.tenant_role || "").replace('_', ' ') || "N/A"}
        </span>
      )
    },
    {
      accessorKey: "access_status",
      header: "Status",
      width: 100,
      cell: ({ row }) => {
        const active = String(row.original.access_status || "").toLowerCase() === 'active'
        return (
          <Badge
            variant={active ? "secondary" : "outline"}
            className={active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "text-muted-foreground"}
          >
            {row.original.access_status || "Inactive"}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      header: "",
      width: 50,
      cell: ({ row }) => (
        <TenantActionsDropdown tenant={row.original} orgId={orgId} setTenantAction={setTenantAction} />
      )
    }
  ], [orgId])

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Attached Tenants</h3>
            <p className="text-[12px] text-muted-foreground">Tenants associated with this organization.</p>
          </div>
        </div>
        <CreateOrganizationModal existingOrganization={{ id: orgId, name: organizationName }}>
          <Button variant="outline" size="sm" className="text-xs shadow-none">
            <Plus className="size-3.5 mr-1.5" /> Add Tenant
          </Button>
        </CreateOrganizationModal>
      </div>

      <div className="relative">
        <DataTable
          data={Array.isArray(tenants) ? tenants : []}
          columns={columns}
          isLoading={isTenantsLoading}
          enablePagination={true}
          pageSize={5}
          totalItems={Array.isArray(tenants) ? tenants.length : 0}
          stickyHeader
          tableContainerClassName="border-0 rounded-none bg-transparent"
          emptyState={
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <h3 className="text-sm font-semibold text-foreground">No Tenants Found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                There are no tenants currently attached to this organization.
              </p>
            </div>
          }
        />
      </div>

      <ActivateTenantDialog tenant={tenantAction?.type === 'activate' ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <DeactivateTenantDialog tenant={tenantAction?.type === 'deactivate' ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <BlockTenantDialog tenant={tenantAction?.type === 'block' ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <UnblockTenantDialog tenant={tenantAction?.type === 'unblock' ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <ExpireTenantDialog tenant={tenantAction?.type === 'expire' ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
      <DeleteTenantDialog tenant={tenantAction?.type === 'delete' ? tenantAction.tenant : null} onClose={() => setTenantAction(null)} orgId={orgId} />
    </div>
  )
}
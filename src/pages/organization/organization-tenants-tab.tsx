import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()
  
  const [tenantAction, setTenantAction] = useState<{ type: "deactivate" | "activate" | "block" | "unblock" | "expire" | "delete", tenant: Tenant } | null>(null)

  const { data: tenants = [], isLoading: isTenantsLoading } = useQuery({
    queryKey: ['organizations', orgId, 'tenants'],
    queryFn: () => organizationsService.getTenants(orgId),
    enabled: !!orgId
  })

  const columns = useMemo<CustomColumnDef<Tenant>[]>(() => [
    { accessorKey: "tenant_admin_full_name", header: "Admin Name", width: 250, cell: ({ row }) => <span className="font-semibold text-foreground dark:text-slate-200">{row.original.tenant_admin_full_name || "N/A"}</span> },
    { accessorKey: "tenant_role", header: "Role", width: 150, cell: ({ row }) => <span className="text-muted-foreground capitalize">{String(row.original.tenant_role || "").replace('_', ' ') || "N/A"}</span> },
    { accessorKey: "access_status", header: "Status", width: 120, cell: ({ row }) => {
        const active = String(row.original.access_status || "").toLowerCase() === 'active';
        return <Badge variant={active ? "secondary" : "outline"} className={active ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "text-muted-foreground"}>{row.original.access_status || "Inactive"}</Badge>
      }
    },
    { accessorKey: "created_at", header: "Created At", width: 150, cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "N/A"}</span> },
    { id: "actions", header: "Actions", width: 80, cell: ({ row }) => <TenantActionsDropdown tenant={row.original} orgId={orgId} setTenantAction={setTenantAction} /> }
  ], [orgId, navigate])

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Attached Tenants</h3>
            <p className="text-[13px] text-muted-foreground">List of tenants associated with this organization.</p>
          </div>
        </div>

        <CreateOrganizationModal existingOrganization={{ id: orgId, name: organizationName }}>
          <Button className="gap-1.5 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4" /> Add Tenant
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
              <div className="mx-auto max-w-md space-y-4">
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  No Tenants Found
                </h3>
                <p className="text-sm text-muted-foreground">
                  There are no tenants currently attached to this organization.
                </p>
              </div>
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

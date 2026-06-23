import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { Tenant, OrganizationTenantsTabProps, TenantActionType } from "@/types";
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { TenantActionDialog } from "@/pages/tenants/tenant-actions/tenant-action-dialog"
import { useOrganizationTenants } from "@/api/hooks/useOrganizations"
import { getTenantColumns } from "@/columns"

export function OrganizationTenantsTab({ orgId, organizationName }: OrganizationTenantsTabProps) {
  const navigate = useNavigate()
  const [tenantAction, setTenantAction] = useState<{ type: TenantActionType; tenant: Tenant } | null>(null)
  const { data: tenants = [], isLoading } = useOrganizationTenants(orgId)

  const columns = useMemo(() => getTenantColumns(orgId, setTenantAction), [orgId])



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

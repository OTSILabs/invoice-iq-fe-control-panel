import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { Tenant, OrganizationTenantsTabProps, TenantActionType } from "@/types";
import { TenantActionDialog } from "@/pages/tenants/tenant-actions/tenant-action-dialog"
import { useOrganizationTenants } from "@/api/hooks/useOrganizations"
import { getTenantColumns } from "@/columns"
import { EmptyState, FilterBar } from "@/components/invoice-ui/design-system"

export function OrganizationTenantsTab({ orgId }: OrganizationTenantsTabProps) {
  const navigate = useNavigate()
  const [tenantAction, setTenantAction] = useState<{ type: TenantActionType; tenant: Tenant } | null>(null)
  const { data: tenants = [], isLoading } = useOrganizationTenants(orgId)

  const columns = useMemo(() => getTenantColumns(orgId, setTenantAction), [orgId])



  return (
    <>
      <div className="table-container">
        {/* Header */}
        <FilterBar className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tenants</h3>
              <p className="text-[12px] text-muted-foreground">Manage tenants for this organization.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs shadow-none"
            onClick={() => navigate(`/organizations/${orgId}/tenants/create`)}
          >
            <Plus className="size-3.5 mr-1.5" /> Add Tenant
          </Button>
        </FilterBar>

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
              <EmptyState
                icon={UserCheck}
                title="No tenants yet"
                description="Add a tenant to get started with this organization."
                className="min-h-0 border-0 bg-transparent py-6"
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs shadow-none gap-1"
                    onClick={() => navigate(`/organizations/${orgId}/tenants/create`)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add tenant
                  </Button>
                }
              />
            </div>
          }
        />
      </div>

      <TenantActionDialog action={tenantAction} onClose={() => setTenantAction(null)} orgId={orgId} />
    </>
  )
}

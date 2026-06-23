import { useState, useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import { useOrganizations } from "@/api/hooks/useOrganizations"
import { organizationsService } from "@/api/services/organizations.service"
import { PageHeader } from "@/components/layout/PageHeader"
import { DataTable } from "@/components/ui/data-table"
import { Loader2, Users, Building, ChevronDown, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Tenant, TenantActionType } from "@/types"
import { Button } from "@/components/ui/button"
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { TenantActionDialog } from "./tenant-actions/tenant-action-dialog"
import { getTenantColumns } from "@/columns"
import { EmptyState, FilterBar, PageShell } from "@/components/invoice-ui/design-system"

export function TenantsPage() {
  const navigate = useNavigate()
  const { data: organizations = [], isLoading: isOrgsLoading } = useOrganizations()
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [orgSearch, setOrgSearch] = useState<string>("")
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false)
  const [tenantAction, setTenantAction] = useState<{ type: TenantActionType; tenant: Tenant } | null>(null)

  // Derive active organization ID: default to first organization if no selection is made
  const activeOrgId = selectedOrgId || organizations[0]?.id || ""
  
  // Fetch tenants for the active organization
  const [tenantsQuery] = useQueries({
    queries: [
      {
        queryKey: ["organizations", activeOrgId, "tenants"],
        queryFn: () => organizationsService.getTenants(activeOrgId),
        enabled: !!activeOrgId,
      },
    ],
  })

  const { data: tenants = [], isLoading: isTenantsLoading } = tenantsQuery

  // Get selected organization details
  const selectedOrg = useMemo(() => {
    return organizations.find((o) => o.id === activeOrgId)
  }, [organizations, activeOrgId])

  // Filtered organizations for search dropdown
  const filteredOrgs = useMemo(() => {
    const query = orgSearch.toLowerCase().trim()
    if (!query) return organizations
    return organizations.filter((org) => org.name.toLowerCase().includes(query))
  }, [organizations, orgSearch])

  // Columns for the Tenant list table
  const columns = useMemo(() => getTenantColumns(activeOrgId, setTenantAction), [activeOrgId])

  // Loading state
  if (isOrgsLoading || isTenantsLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading tenants and organizations...</p>
        </div>
      </PageShell>
    )
  }

  // If no organizations exist
  if (organizations.length === 0) {
    return (
      <PageShell>
        <EmptyState
          icon={Building}
          title="No organizations found"
          description="Onboard your first organization to get started."
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="Tenants Management"
        description="Search organizations and view tenant details."
      />

      {/* Tenants list table - tabular format followed everywhere */}
      <div className="table-container">
        {/* Header - Put the select dropdown inside the table card header */}
        <FilterBar className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Registered Tenants</h3>
              <p className="text-[12px] text-muted-foreground">
                Tenants under organization <strong className="text-primary">{selectedOrg?.name}</strong>. Click a row to view tenant details.
              </p>
            </div>
          </div>
          
          {/* Header actions (Dropdown and Add Tenant button side-by-side) */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Searchable Organization Dropdown placed inside the table card header */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="inline-flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-background/70 px-3 text-xs font-semibold text-foreground shadow-xs transition-colors hover:border-ring/35 sm:w-56"
              >
                <span className="flex items-center gap-2 truncate">
                  <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">Org: {selectedOrg?.name || "Select Organization"}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>

              {isOrgDropdownOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-30 w-full h-full cursor-default bg-transparent border-0"
                    onClick={() => setIsOrgDropdownOpen(false)}
                    aria-label="Close dropdown"
                  />
                  <div className="absolute right-0 z-40 mt-1 w-64 animate-in rounded-xl bg-popover p-2 text-popover-foreground shadow-2xl ring-1 ring-border/70 duration-150 fade-in slide-in-from-top-1">
                    <input
                      type="text"
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      placeholder="Search organization..."
                      className="w-full h-8 px-2.5 text-xs rounded-md border border-input bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 mb-2 text-foreground"
                      aria-label="Search organization"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                      {filteredOrgs.length === 0 ? (
                        <p className="text-xxs text-muted-foreground p-2 text-center">No organizations found</p>
                      ) : (
                        filteredOrgs.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => {
                              setSelectedOrgId(org.id)
                              setIsOrgDropdownOpen(false)
                              setOrgSearch("")
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              org.id === activeOrgId
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span className="truncate">{org.name}</span>
                            {org.id === activeOrgId && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Add Tenant Button */}
            <CreateOrganizationModal existingOrganization={activeOrgId ? { id: activeOrgId, name: selectedOrg?.name || "" } : undefined}>
              <Button size="sm" variant="outline" className="h-9 text-xs font-semibold cursor-pointer shadow-sm inline-flex items-center gap-1.5 border-border">
                <Plus className="h-3.5 w-3.5" /> Add Tenant
              </Button>
            </CreateOrganizationModal>
          </div>
        </FilterBar>

        <DataTable
          data={tenants}
          columns={columns}
          isLoading={isTenantsLoading}
          enablePagination
          pageSize={5}
          totalItems={tenants.length}
          stickyHeader
          tableContainerClassName="border-0 rounded-none bg-transparent"
          containerClassName="rounded-b-xl"
          onRowClick={(tenant) => navigate(`/tenants/${tenant.id}`)}
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <EmptyState
                icon={Users}
                title="No tenants yet"
                description="There are no tenants configured under this organization."
                className="min-h-0 border-0 bg-transparent"
              />
            </div>
          }
        />
      </div>

      <TenantActionDialog
        action={tenantAction}
        onClose={() => setTenantAction(null)}
        orgId={tenantAction?.tenant?.organisation_id || activeOrgId}
      />
    </PageShell>
  )
}

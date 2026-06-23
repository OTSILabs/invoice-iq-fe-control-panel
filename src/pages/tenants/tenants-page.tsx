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
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading tenants and organizations...</p>
        </div>
      </div>
    )
  }

  // If no organizations exist
  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-card/50">
        <Building className="h-8 w-8 text-muted-foreground/60 mb-3" />
        <h3 className="font-medium text-sm text-foreground mb-1">No Organizations Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          Onboard your first organization to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
      <PageHeader
        title="Tenants Management"
        description="Search organizations and view tenant details."
      />

      {/* Tenants list table - tabular format followed everywhere */}
      <div className="flex flex-col border border-border rounded-xl bg-card">
        {/* Header - Put the select dropdown inside the table card header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-4 border-b border-border/50 gap-4">
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
                className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted/50 transition-colors inline-flex items-center gap-2 cursor-pointer text-foreground w-full sm:w-56 justify-between"
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
                  <div className="absolute right-0 mt-1 w-64 rounded-lg border border-border bg-popover shadow-lg z-40 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
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
        </div>

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
              <p className="text-sm font-medium text-foreground mb-1">No tenants yet</p>
              <p className="text-xs text-muted-foreground">There are no tenants configured under this organization.</p>
            </div>
          }
        />
      </div>

      <TenantActionDialog
        action={tenantAction}
        onClose={() => setTenantAction(null)}
        orgId={tenantAction?.tenant?.organisation_id || activeOrgId}
      />
    </div>
  )
}

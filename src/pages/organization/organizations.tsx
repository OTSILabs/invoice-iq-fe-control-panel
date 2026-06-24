import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/api/hooks/useOrganizations"
import { Plus, Building2, UserCheck, BarChart3, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { OrgCard } from "./components/org-card"
import { SearchInput } from "@/components/search-input"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatsCard } from "@/components/StatsCard"
import { EmptyState, PageShell } from "@/components/invoice-ui/design-system"

export function Organizations() {
  const navigate = useNavigate()
  const { data: organizations = [], isLoading } = useOrganizations()
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return organizations
    return organizations.filter(org =>
      org.name.toLowerCase().includes(query) ||
      org.slug?.toLowerCase().includes(query) ||
      String(org.id).includes(query)
    )
  }, [organizations, searchQuery])

  const totalTenants = useMemo(() =>
    organizations.reduce((sum, org) => sum + (org.tenant_count ?? 0), 0)
  , [organizations])

  const hasOrgs = organizations.length > 0

  return (
    <PageShell>
      <PageHeader
        title="Organizations"
        description="Manage and onboard organizations within your control panel."
      />

      {hasOrgs && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatsCard label="Total organizations" value={organizations.length} icon={Building2} />
          <StatsCard label="Total tenants" value={totalTenants} icon={UserCheck} />
          <StatsCard
            label="Avg tenants / org"
            value={Math.round(totalTenants / organizations.length) || 0}
            icon={BarChart3}
          />
        </div>
      )}

      {isLoading ? null : !hasOrgs ? (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Get started by onboarding your first organization into the platform control panel."
          actions={
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/organizations/create")}>
              <Plus className="h-3.5 w-3.5" /> Onboard Organization
            </Button>
          }
        />
      ) : (
        <div className="surface-card p-3 shadow-none">
          <div className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-end sm:justify-end">
            {/* <h1 className="text-section-title">All organizations</h1> */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search organizations..."
                className="w-full sm:w-64"
              />
              <Button
                size="sm"
                className="w-full sm:w-auto font-medium gap-1.5 shrink-0"
                onClick={() => navigate("/organizations/create")}
              >
                <Plus className="h-4 w-4" /> Start onboarding
              </Button>
            </div>
          </div>

        {filtered.length > 0 ? (
         <div className="grid grid-cols-1 gap-4 p-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {filtered.map(org => <OrgCard key={org.id} org={org} />)}
           </div>

          ) : (
            <EmptyState
              icon={Search}
              title="No organizations found"
              description={`No organizations match "${searchQuery}". Try a different search term.`}
            />
          )}
        </div>
      )}
    </PageShell>
  )
}
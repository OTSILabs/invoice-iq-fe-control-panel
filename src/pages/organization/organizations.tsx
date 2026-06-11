import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { useOrganizations } from "@/api/hooks/useOrganizations"
import { Plus, Building2, Users, BarChart3, Search } from "lucide-react"
import { OrgCard } from "./components/org-card"
import { SearchInput } from "@/components/search-input"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatsCard } from "@/components/StatsCard"

export function Organizations() {
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
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
      {/* Header */}
      <PageHeader
        title="Organizations"
        description="Manage and onboard organizations within your control panel."
      >
        {hasOrgs && (
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search organizations..."
            className="w-full sm:w-64"
          />
        )}
        <CreateOrganizationModal>
          <Button size="sm" className="w-full sm:w-auto font-medium shadow-sm gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> Start onboarding
          </Button>
        </CreateOrganizationModal>
      </PageHeader>

      {/* Stats */}
      {hasOrgs && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StatsCard
            label="Total organizations"
            value={organizations.length}
            icon={Building2}
          />
          <StatsCard
            label="Total tenants"
            value={totalTenants}
            icon={Users}
          />
          <StatsCard
            label="Avg tenants / org"
            value={Math.round(totalTenants / organizations.length) || 0}
            icon={BarChart3}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? null : !hasOrgs ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-card/50">
          <Building2 className="h-8 w-8 text-muted-foreground/60 mb-3" />
          <h3 className="font-medium text-sm text-foreground mb-1">No organizations yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm text-center mb-5">Get started by onboarding your first organization into the platform control panel.</p>
          <CreateOrganizationModal>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Onboard Organization
            </Button>
          </CreateOrganizationModal>
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All organizations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filtered.map(org => <OrgCard key={org.id} org={org} />)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-card/50">
          <Search className="h-8 w-8 text-muted-foreground/60 mb-3" />
          <h3 className="font-medium text-sm text-foreground mb-1">No organizations found</h3>
          <p className="text-xs text-muted-foreground max-w-sm text-center">No organizations match "{searchQuery}". Try a different search term.</p>
        </div>
      )}
    </div>
  )
}
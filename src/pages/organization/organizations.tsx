import { PageMetadata } from "@/components/layout/PageMetadata"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useOrganizations, useOrganizationsTotal } from "@/api/hooks/useOrganizations"
import { Plus, Building2, UserCheck, BarChart3, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { OrgCard } from "./components/org-card"
import { SearchInput } from "@/components/search-input"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatsCard } from "@/components/StatsCard"
import { EmptyState, PageShell } from "@/components/invoice-ui/design-system"
import { PaginationComponent } from "@/components/ui/pagination-component"
import { usePagination } from "@/hooks/use-pagination"

export function Organizations() {
  const navigate = useNavigate()
  const { search, setSearch, queryParams, paginationProps } = usePagination()

  const { data: organizations = [], isLoading } = useOrganizations(queryParams)
  const { data: total = 0 } = useOrganizationsTotal(queryParams)

  const totalTenants = useMemo(() =>
    organizations.reduce((sum, org) => sum + (org.tenant_count ?? 0), 0)
  , [organizations])

  const isTrulyEmpty = total === 0 && !search
  const hasResults = organizations.length > 0
  const avgTenants = organizations.length > 0 ? Math.round(totalTenants / organizations.length) : 0

  return (
    <PageShell>
      <PageMetadata title="Organizations" description="Manage your client organizations, departments, and custom invoice processing profiles." keywords="organizations, client management, invoice processing" />
      <PageHeader
        title="Organizations"
        description="Manage and onboard organizations within your control panel."
      />

      {hasResults && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatsCard label="Total organizations" value={total} icon={Building2} />
          <StatsCard label="Total tenants" value={totalTenants} icon={UserCheck} />
          <StatsCard
            label="Avg tenants / org"
            value={avgTenants}
            icon={BarChart3}
          />
        </div>
      )}

      {isLoading ? null : isTrulyEmpty ? (
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
        <div className="surface-card overflow-hidden">
          {/* toolbar */}
          <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search organizations..."
                className="w-full sm:w-56"
              />
              <Button
                size="sm"
                className="w-full sm:w-auto font-medium gap-1.5 shrink-0"
                onClick={() => navigate("/organizations/create")}
              >
                <Plus className="h-3.5 w-3.5" /> Start onboarding
              </Button>
            </div>
          </div>

          {hasResults ? (
            <>
              <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {organizations.map(org => <OrgCard key={org.id} org={org} />)}
              </div>
                <PaginationComponent
                  {...paginationProps(total)}
                  className="border-t border-border/60 bg-muted/20 px-4 py-3 mt-4"
                />
           
            </>
          ) : (
            <div className="p-4">
              <EmptyState
                icon={Search}
                title="No organizations found"
                description={`No organizations match "${search}". Try a different search term.`}
              />
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
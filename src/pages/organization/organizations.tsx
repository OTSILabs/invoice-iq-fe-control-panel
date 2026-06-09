import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { useOrganizations } from "@/api/hooks/useOrganizations"
import { Plus, Building2, Users, BarChart3, Search } from "lucide-react"
import { OrgCard } from "./components/org-card"

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Organizations</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage and onboard organizations within your control panel.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {hasOrgs && (
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations..."
              className="h-9 w-full sm:w-64"
            />
          )}
          <CreateOrganizationModal>
            <Button size="sm" className="w-full sm:w-auto font-medium shadow-sm gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> Start onboarding
            </Button>
          </CreateOrganizationModal>
        </div>
      </div>

      {/* Stats */}
      {hasOrgs && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[
            { label: "Total organizations", val: organizations.length, icon: Building2 },
            { label: "Total tenants", val: totalTenants, icon: Users },
            { label: "Avg tenants / org", val: Math.round(totalTenants / organizations.length) || 0, icon: BarChart3 }
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className="relative overflow-hidden bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 transition-all duration-300 hover:border-primary/30 hover:shadow-xs">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold tracking-tight text-foreground mt-1.5">{val}</p>
              </div>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 bg-slate-100/80 text-slate-700 border-slate-200/50 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50">
                <Icon className="h-4 w-4" />
              </div>
            </div>
          ))}
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
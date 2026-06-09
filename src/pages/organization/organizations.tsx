import { useState, useMemo } from "react"
import { organizationsService } from "@/api/services/organizations.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Loader2, Plus, Building2, Users, BarChart3, Search } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { Organization } from "@/types"

/* ─── helpers ─────────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/* ─── OrgCard ─────────────────────────────────────────────────── */

function OrgCard({ org }: { org: Organization }) {
  const initials = org.name ? getInitials(org.name) : "OR"

  return (
    <Link
      to={`/organizations/${org.id}`}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:border-primary/40 hover:bg-slate-50/50 hover:shadow-md hover:-translate-y-0.5 dark:hover:bg-slate-900/10"
      )}
    >
      {/* Top gradient glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-linear-to-r from-primary/30 via-primary to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Top Row: initials, labels, and active badge side-by-side */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Initials (Alphabet) */}
            <div className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase select-none border shrink-0 bg-slate-50 text-slate-700 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/50">
              {initials}
            </div>

            {/* Labels (Title & Tenant Count) - placed aside of the alphabet */}
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors duration-200 truncate" title={org.name}>
                {org.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 select-none">
                <Users className="h-3 w-3 text-muted-foreground/70" />
                <span>{org.tenant_count ?? 0} {org.tenant_count === 1 ? "tenant" : "tenants"}</span>
              </p>
            </div>
          </div>

          {/* Active Badge
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/20 shadow-none select-none shrink-0">
            <span className="relative flex h-1.5 w-1.5 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Active
          </div> */}
        </div>
      </div>

      {/* CTA detail link */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <span className="text-[9px] font-medium text-muted-foreground/80 font-mono uppercase">
          ID: {String(org.id).slice(0, 8)}...
        </span>

        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors duration-200">
          <span>Details</span>
          <ArrowRight className="h-3 w-3 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

/* ─── Organizations page ──────────────────────────────────────── */

export function Organizations() {
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationsService.getAll,
  })

  const [searchQuery, setSearchQuery] = useState("")

  const filteredOrganizations = useMemo(() => {
    if (!organizations) return []
    const query = searchQuery.toLowerCase().trim()
    if (!query) return organizations
    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(query) ||
        (org.slug && org.slug.toLowerCase().includes(query)) ||
        String(org.id).toLowerCase().includes(query)
    )
  }, [organizations, searchQuery])

  const totalTenants = organizations?.reduce((sum, org) => sum + (org.tenant_count ?? 0), 0) ?? 0

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Organizations</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage and onboard organizations within your control panel.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {organizations && organizations.length > 0 && (
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations..."
              className="h-9 w-full sm:w-64"
            />
          )}
          <CreateOrganizationModal>
            <Button size="sm" className="w-full sm:w-auto font-medium shadow-sm gap-1.5 shrink-0">
              <Plus className="h-4 w-4" />
              Start onboarding
            </Button>
          </CreateOrganizationModal>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      {!isLoading && organizations && organizations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[
            {
              label: "Total organizations",
              value: organizations.length,
              icon: Building2,
              color: "bg-slate-100/80 text-slate-700 border-slate-200/50 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50"
            },
            {
              label: "Total tenants",
              value: totalTenants,
              icon: Users,
              color: "bg-slate-100/80 text-slate-700 border-slate-200/50 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50"
            },
            {
              label: "Avg tenants / org",
              value: organizations.length > 0 ? Math.round(totalTenants / organizations.length) : 0,
              icon: BarChart3,
              color: "bg-slate-100/80 text-slate-700 border-slate-200/50 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50"
            },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="relative overflow-hidden bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 transition-all duration-300 hover:border-primary/30 hover:shadow-xs"
              >
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-semibold tracking-tight text-foreground mt-1.5">{s.value}</p>
                </div>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border shrink-0", s.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Main Content Display Area */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/70" />
        </div>
      ) : organizations && organizations.length > 0 ? (
        filteredOrganizations.length > 0 ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              All organizations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredOrganizations.map((org) => (
                <OrgCard key={org.id} org={org} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-card/50">
            <Search className="h-8 w-8 text-muted-foreground/60 mb-3" />
            <h3 className="font-medium text-sm text-foreground mb-1">No organizations found</h3>
            <p className="text-xs text-muted-foreground max-w-sm text-center">
              No organizations match "{searchQuery}". Try a different search term.
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-card/50">
          <Building2 className="h-8 w-8 text-muted-foreground/60 mb-3" />
          <h3 className="font-medium text-sm text-foreground mb-1">No organizations yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm text-center mb-5">
            Get started by onboarding your first organization into the platform control panel.
          </p>
          <CreateOrganizationModal>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Onboard Organization
            </Button>
          </CreateOrganizationModal>
        </div>
      )}

    </div>
  )
}
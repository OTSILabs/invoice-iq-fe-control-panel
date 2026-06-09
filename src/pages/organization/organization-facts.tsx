
import { cn } from "@/lib/utils"
import type { Organization } from "@/types"
import { Badge } from "@/components/ui/badge"

export function OrganizationFacts({ organization }: { organization: Organization | null }) {
  if (!organization) return null

  const initials = organization.name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const tenantCount  = organization.tenant_count ?? 0

  const onboardingStatus = (organization.onboarding_status ?? "complete").toLowerCase()
  const onboardingCfg: Record<string, { label: string; className: string }> = {
    complete:    { label: "Complete",    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900" },
    pending:     { label: "Pending",     className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900" },
    in_progress: { label: "In progress", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900" },
  }
  const onboardingStyle = onboardingCfg[onboardingStatus] ?? onboardingCfg.complete

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">

      {/* Accent stripe */}
      <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />

      {/* Hero */}
      <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug">{organization.name}</p>
            <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{organization.id}</p>
          </div>
        </div>

   
      </div>

      {/* Facts mosaic */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border">

        <div className="px-3 py-2.5 hover:bg-muted/40 transition-colors">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Onboarding</p>
          <Badge variant="outline" className={cn("text-xxs px-2 py-0 font-medium border", onboardingStyle.className)}>
            {onboardingStyle.label}
          </Badge>
        </div>

        <div className="px-3 py-2.5 hover:bg-muted/40 transition-colors">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Tenants</p>
          <p className="text-sm font-semibold text-foreground">{tenantCount}</p>
        </div>

        <div className="px-3 py-2.5 hover:bg-muted/40 transition-colors">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Created</p>
          <p className="text-xs font-medium text-foreground">
            {organization.created_at
              ? new Date(organization.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "N/A"}
          </p>
        </div>

        <div className="px-3 py-2.5 hover:bg-muted/40 transition-colors">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Updated</p>
          <p className="text-xs font-medium text-foreground">
            {organization.updated_at
              ? new Date(organization.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "N/A"}
          </p>
        </div>

        {/* Organization ID — full width, compact */}
        <div className="col-span-2 px-3 py-2.5 hover:bg-muted/40 transition-colors">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Organization ID</p>
          <p className="font-mono text-xs font-medium text-foreground truncate" title={organization.id}>
            {organization.id}
          </p>
        </div>

      </div>

      {/* Capacity bar */}
     

    </div>
  )
}

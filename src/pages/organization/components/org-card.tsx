import { Link } from "react-router-dom"
import { Users, ArrowRight, Calendar, Globe, Tag } from "lucide-react"
import { getInitials } from "@/lib/utils"
import type { Organization } from "@/types"
import { ActiveStatusBadge } from "@/columns"

export function OrgCard({ org }: { org: Organization }) {
  const initials = org.name ? getInitials(org.name) : "OR"



  const formattedDate = org.created_at
    ? new Date(org.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <Link
      to={`/organizations/${org.id}`}
      className="surface-card group relative flex min-h-42 flex-col justify-between overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_color-mix(in_oklch,var(--foreground)_8%,transparent),0_20px_48px_color-mix(in_oklch,var(--foreground)_8%,transparent)]"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-lg bg-primary/8 text-sm font-semibold uppercase text-primary ring-1 ring-primary/15">
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-tight text-foreground transition-colors duration-150 group-hover:text-primary" title={org.name}>
                {org.name}
              </h3>
              <p className="mt-1 flex select-none items-center gap-1 text-xs font-medium text-muted-foreground">
                <Users className="h-3 w-3 text-muted-foreground/60" />
                <span>{org.tenant_count ?? 0} {org.tenant_count === 1 ? "tenant" : "tenants"}</span>
              </p>
            </div>
          </div>

          <ActiveStatusBadge status={org.onboarding_status || "Complete"} className="shrink-0 select-none px-2 py-0.5 text-[9px] uppercase tracking-wider" />
        </div>

       
        <div className="grid grid-cols-1 gap-2  text-xs border-t border-border/35 pt-3 text-muted-foreground">
          <div className="flex min-w-0 items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="truncate" title={org.slug}>
              ID: {String(org.id)}
            </span>
          </div>

          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              <span>
                Created: <span className="font-semibold text-foreground">{formattedDate}</span>
              </span>
            </div>
          )}

          {org.tenant_role && (
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              <span>
                Role: <span className="font-semibold text-foreground capitalize">{org.tenant_role}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-border/35 pt-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors duration-150 group-hover:text-primary">
          <span>Details</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

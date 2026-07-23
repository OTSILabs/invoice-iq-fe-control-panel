import { Link } from "react-router-dom"
import { UserCheck, ArrowRight, Calendar, Globe } from "lucide-react"
import { getInitials } from "@/lib/utils"
import type { Organization } from "@/types"
import { ActiveStatusBadge } from "@/components/invoice-ui/active-status-badge"


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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_4px_20px_color-mix(in_oklch,var(--foreground)_6%,transparent)]"
    >
      {/* top section */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg bg-primary/8 text-xs font-bold uppercase text-primary ring-1 ring-primary/15">
            {initials}
          </div>
          <div className="min-w-0">
            <h3
              className="truncate text-[0.8125rem] font-semibold tracking-tight text-foreground transition-colors duration-150 group-hover:text-primary"
              title={org.name}
            >
              {org.name}
            </h3>
            <p className="mt-0.5 flex select-none items-center gap-1 text-xs text-muted-foreground">
              <UserCheck className="h-3 w-3 shrink-0 opacity-60" />
              {org.tenant_count ?? 0} {org.tenant_count === 1 ? "tenant" : "tenants"}
            </p>
          </div>
        </div>
        <ActiveStatusBadge
          status={org.onboarding_status || "Complete"}
          className="shrink-0 select-none"
        />
      </div>

      {/* meta */}
      <div className="mx-4 flex flex-col gap-1.5 border-t border-border/35 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 shrink-0 opacity-50" />
          <span className="truncate" title={String(org.id)}>
           ID :  {String(org.id)}
          </span>
        </div>
        {formattedDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0 opacity-50" />
            <span>
              Created{" "} :
              <span className="">{" " + formattedDate}</span>
            </span>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="mt-auto flex items-center justify-end border-t border-border/35 px-4 py-2.5">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-150 group-hover:text-primary">
          Details
          <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
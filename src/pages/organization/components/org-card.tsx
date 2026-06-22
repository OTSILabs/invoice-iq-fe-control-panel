import { Link } from "react-router-dom"
import { Users, ArrowRight, Calendar, Globe, Tag } from "lucide-react"
import { getInitials } from "@/lib/utils"
import type { Organization } from "@/types"
import { cn } from "@/lib/utils"

export function OrgCard({ org }: { org: Organization }) {
  const initials = org.name ? getInitials(org.name) : "OR"

  // Onboarding status config
  const statusCfg = {
    complete: { label: "Complete", className: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" },
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40" },
    in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40" },
  }[org.onboarding_status?.toLowerCase() || "complete"] || { label: "Complete", className: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" }

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
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-card p-4 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg dark:hover:bg-slate-900/10"
    >
      {/* Accent glow on top header */}
     

      <div className="space-y-4">
        {/* Header section: Initials + Title & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Initials badge */}
            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold uppercase select-none border shrink-0 bg-primary/5 text-primary border-primary/10 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700/50">
              {initials}
            </div>

            {/* Title & Tenant count */}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-150 truncate" title={org.name}>
                {org.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 select-none font-medium">
                <Users className="h-3 w-3 text-muted-foreground/60" />
                <span>{org.tenant_count ?? 0} {org.tenant_count === 1 ? "tenant" : "tenants"}</span>
              </p>
            </div>
          </div>

          {/* Onboarding Status Badge */}
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 select-none", statusCfg.className)}>
            {statusCfg.label}
          </span>
        </div>

        {/* Middle details grid */}
        <div className="grid grid-cols-1 gap-2 pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground">
          {/* Slug / Domain */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Globe className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            <span className="truncate" title={org.slug}>
              ID: {String(org.id)}
            </span>
          </div>

          {/* Date Created */}
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <span>
                Created: <span className="font-semibold text-foreground">{formattedDate}</span>
              </span>
            </div>
          )}

          {/* Tenant Role (or billing plan if exists) */}
          {org.tenant_role && (
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <span>
                Role: <span className="font-semibold text-foreground capitalize">{org.tenant_role}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer link/details link */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
        <span className="text-[9px] font-mono tracking-tight text-muted-foreground/60 uppercase select-all" title="Click to copy full ID">
         
        </span>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors duration-150">
          <span>Details</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

import { Link } from "react-router-dom"
import { Users, ArrowRight } from "lucide-react"
import { getInitials } from "@/lib/utils"
import type { Organization } from "@/types"

export function OrgCard({ org }: { org: Organization }) {
  const initials = org.name ? getInitials(org.name) : "OR"

  return (
    <Link
      to={`/organizations/${org.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 ease-out hover:border-primary/40 hover:bg-slate-50/50 hover:shadow-md hover:-translate-y-0.5 dark:hover:bg-slate-900/10"
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

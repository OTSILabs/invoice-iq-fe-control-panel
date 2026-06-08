import { organizationsService } from "@/api/services/organizations.service"
import { Button } from "@/components/ui/button"
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Loader2, Plus } from "lucide-react"
import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

/* ─── helpers ─────────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/**
 * Five accent slots built entirely from your CSS variables.
 * Each slot uses a different chart color (chart-1 … chart-5) for
 * the avatar / badge tint, and primary for hover accents.
 */
const SLOTS = [
  { tint: "bg-chart-1/15 text-chart-1",  badge: "bg-chart-1/15 text-chart-1"  },
  { tint: "bg-chart-2/15 text-chart-2",  badge: "bg-chart-2/15 text-chart-2"  },
  { tint: "bg-chart-3/15 text-chart-3",  badge: "bg-chart-3/15 text-chart-3"  },
  { tint: "bg-chart-4/15 text-chart-4",  badge: "bg-chart-4/15 text-chart-4"  },
  { tint: "bg-chart-5/15 text-chart-5",  badge: "bg-chart-5/15 text-chart-5"  },
] as const

function getSlot(id: string | number) {
  const n = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return SLOTS[n % SLOTS.length]
}

/* ─── ripple ──────────────────────────────────────────────────── */

interface RippleItem { id: number; x: number; y: number; size: number }

/* ─── OrgCard ─────────────────────────────────────────────────── */

function OrgCard({ org, index }: { org: any; index: number }) {
  const slot = getSlot(org.id)
  const cardRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<RippleItem[]>([])

  function spawnRipple(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current!.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.2
    const id = Date.now()
    setRipples((p) => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, size }])
    setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 550)
  }

  return (
    <div
      ref={cardRef}
      onClick={spawnRipple}
      style={{ animationDelay: `${index * 55}ms` }}
      className={cn(
        "group relative overflow-hidden cursor-pointer",
        "rounded-lg border border-border bg-card",
        "flex flex-col gap-0",
        // entry animation
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        // hover — use primary colour from your theme
        "transition-colors duration-200",
        "hover:border-primary/40 hover:bg-primary/[0.03]",
      )}
    >
      {/* ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full pointer-events-none bg-primary/20 animate-ripple"
          style={{ width: r.size, height: r.size, left: r.x - r.size / 2, top: r.y - r.size / 2 }}
        />
      ))}

      {/* card body */}
      <div className="flex flex-col gap-3 p-4 relative z-10">

        {/* active dot */}


        {/* avatar + name */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium flex-shrink-0",
              "transition-transform duration-200 group-hover:scale-110",
              slot.tint,
            )}
          >
            {getInitials(org.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
              {org.name}
            </p>
            <p className="truncate text-[11px] font-mono text-muted-foreground">{org.slug}</p>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                "transition-transform duration-200 group-hover:scale-105",
                slot.badge,
              )}
            >
              {org.tenant_count ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">tenants</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 text-xs gap-1 shadow-none",
              "transition-all duration-200",
              "group-hover:translate-x-0.5 group-hover:text-primary group-hover:border-primary/40",
            )}
            asChild
          >
            <Link to={`/organizations/${org.id}`} onClick={(e) => e.stopPropagation()}>
              Details <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Organizations page ──────────────────────────────────────── */

export function Organizations() {
  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationsService.getAll,
  })

  const totalTenants = organizations?.reduce((sum, org) => sum + (org.tenant_count ?? 0), 0) ?? 0

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h1 className="text-base font-medium tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and onboard organizations within your control panel.
          </p>
        </div>
        <CreateOrganizationModal>
          <Button size="sm" className="w-full sm:w-auto font-medium px-3 shadow-none">
            <Plus className="h-4 w-4 mr-1.5" />
            Start onboarding
          </Button>
        </CreateOrganizationModal>
      </div>

      {/* ── Stats ── */}
      {!isLoading && organizations && organizations.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total organizations", value: organizations.length },
            { label: "Total tenants",        value: totalTenants },
            {
              label: "Avg tenants / org",
              value: organizations.length > 0
                ? Math.round(totalTenants / organizations.length)
                : 0,
            },
          ].map((s) => (
            <div key={s.label}  className={cn(
        "group relative overflow-hidden cursor-pointer",
        "rounded-lg border border-border bg-card",
        "flex flex-col gap-4 p-4",
        // entry animation
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        // hover — use primary colour from your theme
        "transition-colors duration-200",
        "hover:border-primary/40 hover:bg-primary/[0.03]",
      )}>
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-xl font-medium">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>

      ) : organizations && organizations.length > 0 ? (
        <>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground -mb-3">
            All organizations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org, i) => (
              <OrgCard key={org.id} org={org} index={i} />
            ))}
          </div>
        </>

      ) : (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg">
          <p className="font-medium text-sm mb-1">No organizations yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Get started by onboarding your first organization.
          </p>
          <CreateOrganizationModal>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs shadow-none">
              <Plus className="h-3.5 w-3.5" /> Create organization
            </Button>
          </CreateOrganizationModal>
        </div>
      )}

    </div>
  )
}
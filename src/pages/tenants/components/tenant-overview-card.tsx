import { StatusBadge, ActiveStatusBadge } from "@/columns"
import { CopyButton } from "@/components/ui/copyable-field"
import { formatDate, getInitials } from "@/lib/utils"
import type { Tenant } from "@/types"

interface TenantOverviewCardProps {
  tenant: Tenant
  orgId: string
}

export function TenantOverviewCard({ tenant, orgId }: TenantOverviewCardProps) {
  const initials = tenant.tenant_admin_full_name
    ? getInitials(tenant.tenant_admin_full_name)
    : "TN"

  const details = [
    {
      label: "Tenant ID",
      content: (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-medium text-foreground truncate" title={tenant.id}>{tenant.id}</span>
          <CopyButton value={tenant.id} label="Tenant ID" />
        </div>
      )
    },
    {
      label: "Organization ID",
      content: (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-medium text-foreground truncate" title={tenant.organisation_id || orgId}>
            {tenant.organisation_id || orgId}
          </span>
          <CopyButton value={tenant.organisation_id || orgId || ""} label="Organization ID" />
        </div>
      )
    },
    {
      label: "Slug",
      content: <p className="text-xs font-semibold text-foreground truncate" title={tenant.slug}>{tenant.slug || "—"}</p>
    },
    {
      label: "Tenant Role",
      content: <p className="text-xs font-bold text-foreground capitalize">{tenant.tenant_role?.replace('_', ' ') || "Standard"}</p>
    },
    {
      label: "Access Status",
      content: (
        <ActiveStatusBadge status={tenant.access_status || "Active"} className="text-[11px] px-2 py-0.5 font-medium border w-fit" />
      )
    },
    {
      label: "Provisioning Status",
      content: (
        <ActiveStatusBadge status={tenant.provisioning_status || "Completed"} color="blue" className="text-[11px] px-2 py-0.5 font-medium border w-fit" />
      )
    },
    {
      label: "Created At",
      content: <p className="text-xs font-semibold text-foreground">{formatDate(tenant.created_at)}</p>
    },
    {
      label: "Updated At",
      content: <p className="text-xs font-semibold text-foreground">{formatDate(tenant.updated_at)}</p>
    }
  ]

  return (
    <div className="surface-card w-full overflow-hidden">
        {/* Hero */}
        <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/15">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="truncate text-sm font-semibold leading-snug text-foreground" title={tenant.tenant_admin_full_name}>
                  {tenant.tenant_admin_full_name || tenant.id}
                </p>
                <StatusBadge status={tenant.access_status || "active"} />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{tenant.id}</p>
            </div>
          </div>
        </div>

        {/* Facts mosaic */}
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {details.map((item) => (
            <div key={item.label} className="flex min-h-20 flex-col justify-center rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/45">
              <p className="text-xs font-semibold text-muted-foreground mb-1">{item.label}</p>
              {item.content}
            </div>
          ))}
        </div>
    </div>
  )
}

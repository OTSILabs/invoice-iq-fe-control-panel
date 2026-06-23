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
    <div className="w-full">
      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between">
        {/* Accent stripe */}
        <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />

        {/* Hero */}
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold ">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-foreground leading-snug truncate" title={tenant.tenant_admin_full_name}>
                  {tenant.tenant_admin_full_name || tenant.id}
                </p>
                <StatusBadge status={tenant.access_status || "active"} />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{tenant.id}</p>
            </div>
          </div>
        </div>

        {/* Facts mosaic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
          {details.map((item) => (
            <div key={item.label} className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-xs font-semibold text-muted-foreground mb-1">{item.label}</p>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

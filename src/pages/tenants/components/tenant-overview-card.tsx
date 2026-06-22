import { Badge } from "@/components/ui/badge"
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
        <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400 w-fit">
          {tenant.access_status || "Active"}
        </Badge>
      )
    },
    {
      label: "Provisioning Status",
      content: (
        <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-medium border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400 w-fit">
          {tenant.provisioning_status || "Completed"}
        </Badge>
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
                <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  {tenant.access_status || "Active"}
                </Badge>
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

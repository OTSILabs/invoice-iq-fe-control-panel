import { User, FileText, Building2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { Tenant } from "@/types"
import { ActiveStatusBadge } from "@/columns"

interface TenantOverviewTabProps {
  tenant: Tenant
  onAction: (action: {
    type: "activate" | "deactivate" | "block" | "unblock" | "expire" | "delete" | "assignPlan"
    tenant: Tenant
  }) => void
}

export function TenantOverviewTab({ tenant, onAction }: TenantOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Profile Details */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between min-h-[240px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Tenant Profile</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Display Name</span>
                <span className="text-xs font-semibold text-foreground">{tenant.profile?.display_name || "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Domain Name</span>
                <span className="text-xs font-semibold text-foreground">{tenant.profile?.domain_name || "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Reporting Currency</span>
                <span className="text-xs font-semibold text-foreground">{tenant.profile?.reporting_currency || "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Timezone</span>
                <span className="text-xs font-semibold text-foreground">{tenant.profile?.timezone || "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Full Name</span>
                <span className="text-xs font-semibold text-foreground">{tenant.tenant_admin_full_name || "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Email</span>
                <span className="text-xs font-semibold text-foreground truncate block" title={tenant.tenant_admin_email}>
                  {tenant.tenant_admin_email || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Subscription Plan */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between min-h-[240px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Subscription Plan</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Effective Plan ID</span>
                <span className="text-xs font-mono font-semibold text-foreground">{tenant.effective_plan_id || "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Plan Valid From</span>
                <span className="text-xs font-semibold text-foreground">{formatDate(tenant.effective_plan_valid_from)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Plan Valid To</span>
                <span className="text-xs font-semibold text-foreground">{formatDate(tenant.effective_plan_valid_to)}</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction({ type: "assignPlan", tenant })}
              className="w-full text-xs font-medium cursor-pointer"
            >
              Manage Subscription
            </Button>
          </div>
        </div>

        {/* Card 3: Governance & Compliance */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between min-h-[240px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Governance & Compliance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Governance Blocked</span>
                <ActiveStatusBadge status={tenant.governance_blocked ? "Blocked" : "Active / Unblocked"} className="text-[10px] w-fit mt-0.5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Governance Outcome</span>
                <span className="text-xs font-semibold text-foreground truncate" title={tenant.governance_outcome || "None"}>
                  {tenant.governance_outcome || "None"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Provisioned At</span>
                <span className="text-xs font-semibold text-foreground">{formatDate(tenant.provisioned_at)}</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction({ type: tenant.governance_blocked ? "unblock" : "block", tenant })}
              className="w-full text-xs font-medium cursor-pointer"
            >
              {tenant.governance_blocked ? "Unblock Governance" : "Block Governance"}
            </Button>
          </div>
        </div>
      </div>

      {tenant.last_error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-start gap-2.5">
          <Info className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block">Last Provisioning Error Logged</span>
            <p className="text-xs font-mono break-all">{tenant.last_error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

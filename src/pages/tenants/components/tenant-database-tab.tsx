import { Loader2, ArrowUpRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyableField } from "./copyable-field"
import type { Tenant } from "@/types"

interface TenantDatabaseTabProps {
  tenant: Tenant
  onRetry: () => void
  isPendingRetry: boolean
  onMigrate: () => void
  isPendingMigrate: boolean
}

export function TenantDatabaseTab({
  tenant,
  onRetry,
  isPendingRetry,
  onMigrate,
  isPendingMigrate,
}: TenantDatabaseTabProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground mb-1">Database Configurations</h3>
        <p className="text-xs text-muted-foreground">
          View primary connection settings and database credentials for this tenant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-6 border-b border-border/60">
        <div className="space-y-4">
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Database Engine</span>
            <span className="text-xs font-bold text-foreground">PostgreSQL</span>
          </div>
          <CopyableField label="Database Name" value={tenant.db_name || ""} isSensitive={true} />
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Port</span>
            <span className="text-xs font-mono font-bold text-foreground">{tenant.db_port || "—"}</span>
          </div>
        </div>

        <div className="space-y-4">
          <CopyableField label="Host Address" value={tenant.db_host || ""} isSensitive={true} />
          <CopyableField label="Master Username" value={tenant.db_user || ""} isSensitive={true} />
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-xs font-semibold text-muted-foreground">SSL Mode</span>
            <span className="text-xs font-bold text-foreground">Require</span>
          </div>
        </div>
      </div>

      {/* Database Actions */}
      <div className="pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Database Maintenance Operations
        </h4>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onMigrate}
            disabled={isPendingMigrate}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
          >
            {isPendingMigrate ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUpRight className="h-3.5 w-3.5" />
            )}
            Migrate Database Schema
          </Button>

          {tenant.provisioning_status?.toLowerCase() === "failed" || tenant.last_error ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isPendingRetry}
              className="text-xs font-semibold gap-1.5 border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-800 cursor-pointer"
            >
              {isPendingRetry ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Retry Provisioning Setup
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isPendingRetry}
              className="text-xs font-semibold gap-1.5 text-muted-foreground cursor-pointer"
            >
              {isPendingRetry ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Force Provisioning Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

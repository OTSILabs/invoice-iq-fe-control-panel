import { CopyableField } from "@/components/ui/copyable-field"
import type { Tenant } from "@/types"
import { MigrateButton } from "./migrate-button"
import { RetryButton } from "./retry-button"

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
    <div className="surface-card space-y-6 p-6">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-foreground">Database Configurations</h3>
        <p className="text-xs text-muted-foreground">
          View primary connection settings and database credentials for this tenant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 border-b border-border/45 pb-6 pt-2 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground">Database Engine</span>
            <span className="text-xs font-bold text-foreground">PostgreSQL</span>
          </div>
          <CopyableField label="Database Name" value={tenant.db_name || ""} isSensitive={true} />
          <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground">Port</span>
            <span className="text-xs font-mono font-bold text-foreground">{tenant.db_port || "—"}</span>
          </div>
        </div>

        <div className="space-y-4">
          <CopyableField label="Host Address" value={tenant.db_host || ""} isSensitive={true} />
          <CopyableField label="Master Username" value={tenant.db_user || ""} isSensitive={true} />
          <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground">SSL Mode</span>
            <span className="text-xs font-bold text-foreground">Require</span>
          </div>
        </div>
      </div>

      {/* Database Actions */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-muted-foreground mb-3">
          Database Maintenance Operations
        </h4>
        <div className="flex flex-wrap gap-3">
          <MigrateButton onMigrate={onMigrate} isPendingMigrate={isPendingMigrate} />

          <RetryButton
            onRetry={onRetry}
            isPendingRetry={isPendingRetry}
            failed={tenant.provisioning_status?.toLowerCase() === "failed" || !!tenant.last_error}
          />
        </div>
      </div>
    </div>
  )
}

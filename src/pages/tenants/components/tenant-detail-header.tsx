import { useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft, RefreshCw, ArrowUpRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Tenant } from "@/types"

interface TenantDetailHeaderProps {
  tenant: Tenant
  orgId: string
  onAction: (action: {
    type: "activate" | "deactivate" | "block" | "unblock" | "expire" | "delete" | "assignPlan"
    tenant: Tenant
  }) => void
  onRetry: () => void
  isPendingRetry: boolean
  onMigrate: () => void
  isPendingMigrate: boolean
}

export function TenantDetailHeader({
  tenant,
  orgId,
  onAction,
  onRetry,
  isPendingRetry,
  onMigrate,
  isPendingMigrate,
}: TenantDetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Tenant Details</h1>
        <p className="text-sm text-muted-foreground">
          View and manage tenant parameters, profile and events log
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Retry Provisioning (Conditional: if provisioning is Failed or there is a last_error) */}
        {(tenant.provisioning_status?.toLowerCase() === "failed" || tenant.last_error) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isPendingRetry}
            className="text-xs font-semibold gap-1.5 border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400 cursor-pointer"
          >
            {isPendingRetry ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Retry Provisioning
          </Button>
        )}

        {/* Migrate Database Schema */}
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
          Migrate Schema
        </Button>

        {/* Activate / Deactivate */}
        {tenant.access_status?.toLowerCase() === "active" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction({ type: "deactivate", tenant })}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30 cursor-pointer"
            >
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction({ type: "expire", tenant })}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30 cursor-pointer"
            >
              Expire
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction({ type: "activate", tenant })}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30 cursor-pointer"
          >
            Activate
          </Button>
        )}

        {/* Delete Tenant */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction({ type: "delete", tenant })}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200/50 dark:border-red-900/30 cursor-pointer"
        >
          <Trash2 className="size-3.5 mr-1" />
          Delete
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="font-medium gap-1.5 border-border shadow-sm cursor-pointer ml-1"
          onClick={() => navigate(`/organizations/${orgId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  )
}

import { useNavigate } from "react-router-dom"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TenantDetailHeaderProps } from "@/types"
import { MigrateButton } from "./migrate-button"
import { RetryButton } from "./retry-button"
import { PageHeader } from "@/components/layout/PageHeader"



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
  const isFromTenantsTab = window.location.pathname.startsWith("/tenants")
  const backUrl = isFromTenantsTab ? "/tenants" : `/organizations/${orgId}`

  return (
    <PageHeader
      title="Tenant Details"
      description="View and manage tenant parameters, profile, configurations, database status, and events."
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Retry Provisioning (Conditional: if provisioning is Failed or there is a last_error) */}
        {(tenant.provisioning_status?.toLowerCase() === "failed" || tenant.last_error) && (
          <RetryButton
            onRetry={onRetry}
            isPendingRetry={isPendingRetry}
            failed={true}
            label="Retry Provisioning"
          />
        )}

        {/* Migrate Database Schema */}
        <MigrateButton
          onMigrate={onMigrate}
          isPendingMigrate={isPendingMigrate}
          label="Migrate Schema"
        />

        {/* Activate / Deactivate */}
        {tenant.access_status?.toLowerCase() === "active" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction({ type: "deactivate", tenant })}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30 "
            >
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction({ type: "expire", tenant })}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30 "
            >
              Expire
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction({ type: "activate", tenant })}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30 "
          >
            Activate
          </Button>
        )}

        {/* Delete Tenant */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onAction({ type: "delete", tenant })}
          className=" text-xs font-semibold"
        >
          <Trash2 className="size-3.5 mr-1" />
          Delete
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="font-medium gap-1.5 border-border  ml-1"
          onClick={() => navigate(backUrl)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </PageHeader>
  )
}

import { ArrowRight, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { ReplicationStepProps } from "@/types"

const replicationOptions = [
  { key: "extraction_fields", label: "Extraction Fields" },
  { key: "extraction_templates", label: "Extraction Templates" },
  { key: "tenant_configurations", label: "Tenant Configurations" },
  { key: "organisation_configurations", label: "Organisation Configurations" },
  { key: "tenant_profiles", label: "Tenant Profiles" },
  { key: "organisation_profiles", label: "Organisation Profiles" },
] as const

export function ReplicationStep({
  createdTenant,
  isReplicating,
  replicationSettings,
  setReplicationSettings,
  onSkip,
  onReplicate,
}: ReplicationStepProps) {
  return (
    <>
      <div className="flex flex-col items-center space-y-3 pt-2 text-center">
        <div className="flex size-14 animate-pulse items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm duration-1500">
          <RefreshCw className="size-6 animate-in text-primary duration-300 zoom-in" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Confirm Replication</h2>
          <p className="text-xs text-muted-foreground">
            Do you want to replicate master data for tenant{" "}
            <span className="font-semibold text-foreground">{createdTenant.slug}</span> now?
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Replication Items
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
            Recommended
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-4">
          {replicationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center gap-2.5 rounded-md p-1.5 transition-colors hover:bg-background/50"
            >
              <Checkbox
                id={`replicate-${option.key}`}
                checked={replicationSettings[option.key]}
                disabled={isReplicating}
                onCheckedChange={(checked) => {
                  setReplicationSettings((current) => ({
                    ...current,
                    [option.key]: checked === true,
                  }))
                }}
                className="size-4 rounded border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor={`replicate-${option.key}`}
                className="cursor-pointer select-none text-xs font-medium leading-none text-foreground/80"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 font-medium"
          disabled={isReplicating}
          onClick={onSkip}
        >
          Skip for Now
          <ArrowRight className="size-3.5 text-muted-foreground" />
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 font-medium"
          disabled={isReplicating}
          onClick={onReplicate}
        >
          {isReplicating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Replicating...
            </>
          ) : (
            <>
              <RefreshCw className="size-4" />
              Replicate Now
            </>
          )}
        </Button>
      </div>
    </>
  )
}

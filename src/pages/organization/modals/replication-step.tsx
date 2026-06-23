import type { ReplicationStepProps } from "@/types";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, RefreshCw, ArrowRight } from "lucide-react"

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
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        <div className="flex size-14 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm animate-pulse duration-1500">
          <RefreshCw className="size-6 text-blue-600 animate-in zoom-in duration-300" />
        </div>
        <div className="space-y-1">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
            Confirm Replication
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Do you want to replicate master data for tenant <span className="font-semibold text-foreground">{createdTenant.slug}</span> now?
          </DialogDescription>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            Replication Items
          </span>
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Recommended
          </span>
        </div>
        <div className="grid gap-2 rounded-lg border border-border bg-background p-4 grid-cols-1">
          {replicationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-background/50 transition-colors"
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
                className="text-xs font-medium leading-none text-foreground/80 cursor-pointer select-none"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          disabled={isReplicating}
          onClick={onSkip}
        >
          Skip for Now
          <ArrowRight className="size-3.5 text-muted-foreground" />
        </Button>
        <Button
          type="button"
          size="sm"
          className="w-full font-medium bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-1.5 cursor-pointer"
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

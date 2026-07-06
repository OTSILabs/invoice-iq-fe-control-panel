import type { ConfigurationsTableHeaderProps } from "@/types";
import { Info, Save } from "lucide-react"
import { Button } from "@/components/ui/button"



export function ConfigurationsTableHeader({
  entityType,
  isSaving,
  hasChanges,
  onSave
}: ConfigurationsTableHeaderProps) {
  return (
    <div className="filter-toolbar p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Info className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Configuration Settings</h3>
          <p className="text-[12px] text-muted-foreground">Manage settings for this {entityType}.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="default"
          type="button"
          className="h-8 text-xs shadow-none "
          onClick={onSave}
          disabled={isSaving || !hasChanges}
        >
          <Save className="size-3.5 mr-1.5" /> {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

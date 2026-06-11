import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErpSettingsHeaderProps {
  isFetching: boolean
  onRefetch: () => void
  onAddClick: () => void
}

export function ErpSettingsHeader({
  isFetching,
  onRefetch,
  onAddClick,
}: ErpSettingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">ERP Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure and maintain enterprise ERP integrations.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onRefetch}
          className="h-9 w-9 shrink-0 cursor-pointer"
        >
          <RefreshCw
            className={isFetching ? "size-4 animate-spin" : "size-4"}
          />
        </Button>

        <Button
          size="sm"
          onClick={onAddClick}
          className="w-full sm:w-auto font-medium px-3 shadow-none shrink-0 gap-1.5 animate-in"
        >
          <Plus className="h-4 w-4" /> Add ERP Setting
        </Button>
      </div>
    </div>
  )
}

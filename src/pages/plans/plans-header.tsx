import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlansHeaderProps {
  onCreateClick: () => void
}

export function PlansHeader({ onCreateClick }: PlansHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Plans & Pricing</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your subscription configurations.</p>
      </div>
      <Button size="sm" onClick={onCreateClick} className="w-full gap-1.5 px-3 sm:w-auto">
        <Plus className="size-4" /> Create Plan
      </Button>
    </div>
  )
}

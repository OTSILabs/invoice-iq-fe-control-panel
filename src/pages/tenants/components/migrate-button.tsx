import { Loader2, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MigrateButtonProps {
  onMigrate: () => void
  isPendingMigrate: boolean
  label?: string
}

export function MigrateButton({
  onMigrate,
  isPendingMigrate,
  label = "Migrate Database Schema",
}: MigrateButtonProps) {
  return (
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
      {label}
    </Button>
  )
}

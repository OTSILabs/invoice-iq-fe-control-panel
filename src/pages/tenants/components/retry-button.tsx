import type { RetryButtonProps } from "@/types";
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"



export function RetryButton({
  onRetry,
  isPendingRetry,
  failed = false,
  label,
}: RetryButtonProps) {
  const displayLabel = label || (failed ? "Retry Provisioning Setup" : "Force Provisioning Retry")
  const className = failed
    ? "text-xs font-semibold gap-1.5 border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400 "
    : "text-xs font-semibold gap-1.5 text-muted-foreground "

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRetry}
      disabled={isPendingRetry}
      className={className}
    >
      {isPendingRetry ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      {displayLabel}
    </Button>
  )
}

import type { CopyableFieldProps } from "@/types";
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { CopyToClipboard } from "./copy-to-clipboard"
import { Button } from "./button";

export { CopyButton } from "./copy-button"
export { MaskedValue } from "./masked-value"



export function CopyableField({ value, label, isSensitive = false }: CopyableFieldProps) {
  const [show, setShow] = useState(!isSensitive)
  const displayValue = show ? String(value) : "••••••••••••••••"

  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 max-w-[70%]">
        <span className="text-xs font-mono font-bold text-foreground truncate" title={show ? String(value) : undefined}>
          {displayValue}
        </span>
        <div className="flex items-center gap-1">
          {isSensitive && (
            <Button
            variant="ghost"
              onClick={() => setShow(!show)}
              className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors "
              title={show ? "Hide" : "Show"}
              type="button"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
          )}
          <CopyToClipboard
            value={value}
            className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-muted hover:text-foreground text-muted-foreground transition-colors "
            iconSize="size-3.5"
          />
        </div>
      </div>
    </div>
  )
}

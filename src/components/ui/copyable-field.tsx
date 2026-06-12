import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { CopyToClipboard } from "./copy-to-clipboard"

interface CopyButtonProps {
  value: string | number
  label: string
}

export function CopyButton({ value, label }: CopyButtonProps) {
  return (
    <CopyToClipboard
      value={value}
      className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1.5 cursor-pointer"
      iconSize="size-3"
      title={`Copy ${label}`}
    />
  )
}

interface CopyableFieldProps {
  value: string | number
  label: string
  isSensitive?: boolean
}

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
            <button
              onClick={() => setShow(!show)}
              className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={show ? "Hide" : "Show"}
              type="button"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          <CopyToClipboard
            value={value}
            className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-muted hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
            iconSize="size-3.5"
          />
        </div>
      </div>
    </div>
  )
}

interface MaskedValueProps {
  value: string | number
}

export function MaskedValue({ value }: MaskedValueProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="flex items-center gap-2 max-w-[200px]">
      <span className="font-mono text-xs text-muted-foreground truncate">{show ? String(value) : "••••••••"}</span>
      <button
        onClick={() => setShow((v) => !v)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        type="button"
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <CopyToClipboard
        value={value}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        iconSize="size-3.5"
      />
    </div>
  )
}

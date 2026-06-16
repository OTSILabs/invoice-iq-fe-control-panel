import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { CopyToClipboard } from "./copy-to-clipboard"

interface MaskedValueProps {
  value: string | number
}

export function MaskedValue({ value }: MaskedValueProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="flex items-center gap-2 max-w-[200px]">
      <span className="font-mono text-xs text-muted-foreground truncate">
        {show ? String(value) : "••••••••"}
      </span>
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

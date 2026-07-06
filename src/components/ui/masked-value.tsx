import type { MaskedValueProps } from "@/types";
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { CopyToClipboard } from "./copy-to-clipboard"
import { Button } from "./button";



export function MaskedValue({ value }: MaskedValueProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="flex items-center gap-2 max-w-[200px]">
      <span className="font-mono text-xs text-muted-foreground truncate">
        {show ? String(value) : "••••••••"}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShow((v) => !v)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors "
       
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
      <CopyToClipboard
        value={value}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors "
        iconSize="size-3.5"
      />
    </div>
  )
}

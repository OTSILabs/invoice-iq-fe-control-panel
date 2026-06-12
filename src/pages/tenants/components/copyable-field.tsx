import { useState } from "react"
import { Check, Copy, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface CopyButtonProps {
  value: string
  label: string
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copied`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }
  return (
    <button
      onClick={handleCopy}
      className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1.5 cursor-pointer"
      title={`Copy ${label}`}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

interface CopyableFieldProps {
  value: string
  label: string
  isSensitive?: boolean
}

export function CopyableField({ value, label, isSensitive = false }: CopyableFieldProps) {
  const [show, setShow] = useState(!isSensitive)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copied`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const displayValue = show ? value : "••••••••••••••••"

  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 max-w-[70%]">
        <span className="text-xs font-mono font-bold text-foreground truncate" title={show ? value : undefined}>
          {displayValue}
        </span>
        <div className="flex items-center gap-1">
          {isSensitive && (
            <button
              onClick={() => setShow(!show)}
              className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={show ? "Hide" : "Show"}
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={!value}
            className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Copy"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

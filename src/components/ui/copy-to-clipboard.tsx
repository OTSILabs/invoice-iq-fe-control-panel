import type { CopyToClipboardProps } from "@/types";
import * as React from "react"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "./button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"



export function CopyToClipboard({
  value,
  className,
  isLoading = false,
  iconSize = "size-4",
  title,
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent link or row click events
    try {
      const valueToCopy = value?.props?.value || value
      if (!valueToCopy) return
      await navigator.clipboard.writeText(String(valueToCopy))
      setCopied(true)
      toast.success("Copied to clipboard")

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  if (isLoading || !value) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn("p-0", className, iconSize)}
      title={title || "Copy to clipboard"}
      type="button"
    >
      {copied ? (
        <Check className={cn("text-green-600", iconSize)} />
      ) : (
        <Copy className={cn(iconSize)} />
      )}
    </Button>
  )
}

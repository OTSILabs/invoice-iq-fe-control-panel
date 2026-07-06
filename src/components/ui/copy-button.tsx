import type { CopyButtonProps } from "@/types";
import { CopyToClipboard } from "./copy-to-clipboard"



export function CopyButton({ value, label }: CopyButtonProps) {
  return (
    <CopyToClipboard
      value={value}
      className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1.5 "
      iconSize="size-3"
      title={`Copy ${label}`}
    />
  )
}

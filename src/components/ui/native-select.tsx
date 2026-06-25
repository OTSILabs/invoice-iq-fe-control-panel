import * as React from "react"

import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"
import { NativeSelectOption } from "./native-select-option"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
  selectClassName?: string
}

function NativeSelect({
  className,
  selectClassName,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "h-9 w-full min-w-0 appearance-none rounded-lg border border-border bg-transparent py-1 pl-3 pr-9 text-sm text-foreground outline-none transition-colors select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground/80 hover:border-ring/35 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=sm]:h-8 dark:bg-transparent dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          selectClassName
        )}
        {...props}
      />
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground select-none" aria-hidden="true" data-slot="native-select-icon" />
    </div>
  )
}

export { NativeSelect, NativeSelectOption }

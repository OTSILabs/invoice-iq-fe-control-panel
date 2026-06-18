import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon: LucideIcon
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  className,
  ...props
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 transition-all duration-300 hover:border-primary/30 hover:shadow-xs",
        className
      )}
      {...props}
    >
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold tracking-tight text-foreground mt-1.5">
          {value}
        </p>
      </div>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 bg-muted text-muted-foreground border-border">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  )
}

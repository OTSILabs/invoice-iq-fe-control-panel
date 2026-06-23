import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { StatCard } from "@/components/invoice-ui/design-system"

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
    <StatCard
      label={label}
      value={value}
      icon={Icon}
      className={cn(className)}
      {...props}
    />
  )
}

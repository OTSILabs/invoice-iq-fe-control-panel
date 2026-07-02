import type { StatsCardProps } from "@/types";

import { cn } from "@/lib/utils"

import { StatCard } from "@/components/invoice-ui/design-system"



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

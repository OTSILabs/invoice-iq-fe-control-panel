import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { FileX2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function PageShell({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("page-container", className)} {...props}>
      {children}
    </div>
  )
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  ...props
}: React.ComponentProps<typeof Card> & {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  contentClassName?: string
}) {
  return (
    <Card className={cn("surface-card gap-0 overflow-hidden p-0", className)} {...props}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-col gap-3 border-b border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && <CardTitle className="text-section-title">{title}</CardTitle>}
            {description && (
              <CardDescription className="mt-1 text-caption">
                {description}
              </CardDescription>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}

export function FilterBar({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("filter-toolbar", className)} {...props}>
      {children}
    </div>
  )
}

export function EmptyState({
  icon: Icon = FileX2,
  title,
  description,
  actions,
  className,
}: {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm ring-1 ring-border/65">
        <Icon className="size-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {actions && <div className="mt-5 flex items-center justify-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  label: string
  value: string | number
  icon: LucideIcon
}) {
  return (
    <div
      className={cn(
        "surface-card flex items-center justify-between gap-4 p-4 transition-colors hover:bg-card/90",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </div>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
        <Icon className="size-4" />
      </div>
    </div>
  )
}

export type SegmentedFilterItem = {
  value: string
  label: React.ReactNode
  count?: number
  icon?: LucideIcon
}

export function SegmentedFilter({
  value,
  items,
  onValueChange,
  className,
}: {
  value: string
  items: SegmentedFilterItem[]
  onValueChange: (value: string) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex w-fit max-w-full items-center gap-1.5 overflow-x-auto rounded-lg bg-muted/70 p-1 ring-1 ring-border/50 select-none",
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = value === item.value

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold transition-all duration-150",
              isActive
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-3.5" />}
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "bg-background/70 text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export type SemanticTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent"

const semanticBadgeTone: Record<SemanticTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  info: "border-primary/25 bg-primary/10 text-primary",
  accent: "border-border bg-secondary text-secondary-foreground",
}

const semanticBadgeDot: Record<SemanticTone, string> = {
  neutral: "bg-muted-foreground/70",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-primary",
  accent: "bg-secondary-foreground/70",
}

export function SemanticBadge({
  tone = "neutral",
  children,
  className,
  showDot = false,
}: {
  tone?: SemanticTone
  children: React.ReactNode
  className?: string
  showDot?: boolean
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-full px-2 text-[0.68rem] font-semibold shadow-none",
        semanticBadgeTone[tone],
        className,
      )}
    >
      {showDot && <span className={cn("size-1.5 rounded-full", semanticBadgeDot[tone])} />}
      {children}
    </Badge>
  )
}

export function StatusBadge({
  status,
  active,
  tone,
  className,
  showDot = false,
}: {
  status?: string | null
  active?: boolean | null
  tone?: SemanticTone
  className?: string
  showDot?: boolean
}) {
  const normalized = status ? status.toLowerCase().trim() : active ?? true ? "active" : "inactive"
  const resolvedTone: SemanticTone = tone
    ?? (["success", "active", "complete", "completed", "enabled"].includes(normalized)
      ? "success"
      : ["blocked", "deactivated", "failed", "error", "inactive"].includes(normalized)
      ? "danger"
      : ["expired"].includes(normalized)
      ? "danger"
      : ["pending", "warning"].includes(normalized)
      ? "warning"
      : ["in_progress", "inprogress", "processing"].includes(normalized)
      ? "info"
      : "neutral")
  const label = status || (active ?? true ? "Active" : "Inactive")

  return (
    <SemanticBadge tone={resolvedTone} className={className} showDot={showDot}>
      {label}
    </SemanticBadge>
  )
}

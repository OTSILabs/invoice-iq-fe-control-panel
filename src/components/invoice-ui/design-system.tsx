import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { FileX2 } from "lucide-react"

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
    <Card className={cn("surface-card gap-0 p-0", className)} {...props}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-col gap-3 border-b border-border/45 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
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
        "flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center",
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

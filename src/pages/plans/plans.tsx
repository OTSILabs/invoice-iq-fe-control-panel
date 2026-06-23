import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, AlertCircle, RefreshCw, Plus, Layers, Sparkles, CheckCircle2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { usePlans } from "@/api/hooks/usePlans"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/search-input"
import { planColumns as columns } from "@/columns"
import { EmptyState, FilterBar, PageShell } from "@/components/invoice-ui/design-system"

import { Select,SelectContent,SelectItem,SelectTrigger, SelectValue } from "@/components/ui/select"

const normalizePlanType = (type: string) => {
  const lower = String(type).toLowerCase()
  return lower === "free trail" ? "free trial" : lower
}

export function Plans() {
  const { data: plans = [], isLoading, isError, refetch, isFetching } = usePlans()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [status, setStatus] = useState("all")
  const [planTypeFilter, setPlanTypeFilter] = useState("all")

  const statusFiltered = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return plans.filter((p) => {
      const active = p.is_active !== false
      if (status === "active" && !active) return false
      if (status === "inactive" && active) return false
      return !q || [p.plan_type, p.plan_interval, p.price_per_invoice_currency, p.price_per_invoice_amount, p.description]
        .some((v) => v && String(v).toLowerCase().includes(q))
    })
  }, [plans, searchText, status])

  const typeCounts = useMemo(() =>
    statusFiltered.reduce((acc, p) => {
      acc.all++
      const t = normalizePlanType(p.plan_type)
      if (t === "basic") acc.basic++
      else if (t === "free trial") acc.freeTrial++
      return acc
    }, { all: 0, basic: 0, freeTrial: 0 }),
  [statusFiltered])

  const filteredPlans = useMemo(() =>
    planTypeFilter === "all"
      ? statusFiltered
      : statusFiltered.filter((p) => normalizePlanType(p.plan_type) === normalizePlanType(planTypeFilter)),
  [planTypeFilter, statusFiltered])

  if (isLoading) return (
    <PageShell className="min-h-[60vh] items-center justify-center">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="font-medium text-muted-foreground">Fetching subscription plans...</p>
    </PageShell>
  )

  if (isError) return (
    <PageShell className="min-h-[60vh] max-w-md items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Failed to load plans</h2>
        <p className="mt-1 text-muted-foreground">There was a connection issue. Please check your network and API config.</p>
      </div>
      <Button onClick={() => refetch()} variant="outline" className="gap-2" disabled={isFetching}>
        <RefreshCw className="size-4" /> Try Again
      </Button>
    </PageShell>
  )

  return (
    <PageShell>
      <PageHeader
        title="Plans & Pricing"
        description="Manage your subscription configurations, features, and pricing tiers."
      >
        <Button size="sm" onClick={() => navigate("/plan/create")} className="w-full gap-1.5 px-3 sm:w-auto cursor-pointer" disabled={isFetching}>
          <Plus className="size-4" /> Create Plan
        </Button>
      </PageHeader>

      <div className="table-container">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar>
            <div className="flex w-fit items-center gap-1.5 rounded-lg bg-muted/70 p-1 ring-1 ring-border/50 select-none">
              {[
                { value: "all", label: "All Plans", count: typeCounts.all, icon: Layers },
                { value: "basic", label: "Basic", count: typeCounts.basic, icon: CheckCircle2 },
                { value: "free trial", label: "Free Trial", count: typeCounts.freeTrial, icon: Sparkles }
              ].map(({ value, label, count, icon: Icon }) => {
                const isActive = planTypeFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPlanTypeFilter(value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
                      isActive 
                        ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{label}</span>
                    <span className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none",
                      isActive 
                        ? "bg-primary/12 text-primary"
                        : "bg-background/70 text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
                disabled={isFetching} 
                placeholder="Search plans..." 
                className="w-full sm:w-72" 
              />
              <Select value={status} onValueChange={setStatus} disabled={isFetching}>
                <SelectTrigger className="h-9 w-full text-xs font-medium sm:w-44">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent align="end">
                  {[["all", "All Statuses"], ["active", "Active"], ["inactive", "Inactive"]].map(([v, l]) => (
                    <SelectItem key={v} value={v} className="cursor-pointer text-xs">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()} className="size-9 shrink-0 cursor-pointer" disabled={isFetching}>
                <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </FilterBar>

          <DataTable
            data={filteredPlans}
            columns={columns.map((c) => ({ ...(c as any), enableSorting: false }))}
            isLoading={isLoading || isFetching}
            enablePagination
            pageSize={10}
            totalItems={filteredPlans.length}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
            emptyState={
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <EmptyState
                  icon={CreditCard}
                  title={searchText || status !== "all" || planTypeFilter !== "all" ? "No plans match filters" : "No subscription plans"}
                  description={searchText || status !== "all" || planTypeFilter !== "all" ? "We couldn't find any plans matching your search or filters. Try clearing them to see all plans." : "Create your first billing plan to manage subscription configurations."}
                  className="min-h-0 border-0 bg-transparent py-6"
                  actions={plans.length === 0 ? (
                    <Button onClick={() => navigate("/plan/create")} size="sm" disabled={isFetching}>
                      <Plus className="size-3.5" /> Create Plan
                    </Button>
                  ) : undefined}
                />
              </div>
            }
          />
        </div>
      </div>
    </PageShell>
  )
}

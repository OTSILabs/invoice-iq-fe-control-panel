import { PageMetadata } from "@/components/layout/PageMetadata"
import { usePlans } from "@/api/hooks/usePlans"
import { planColumns as columns } from "@/columns"
import { EmptyState, FilterBar, PageShell } from "@/components/invoice-ui/design-system"
import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"
import { AlertCircle, CreditCard, Loader2, Plus, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  // const typeCounts = useMemo(() =>
  //   statusFiltered.reduce((acc, p) => {
  //     acc.all++
  //     const t = normalizePlanType(p.plan_type)
  //     if (t === "basic") acc.basic++
  //     else if (t === "free trial") acc.freeTrial++
  //     return acc
  //   }, { all: 0, basic: 0, freeTrial: 0 }),
  // [statusFiltered])

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
      <PageMetadata title="Plan" description="Configure pricing plans, invoice extraction limits, and service intervals." keywords="plans, billing, pricing, extraction limits" />
      <PageHeader
        title="Plans & Pricing"
        description="Manage your subscription configurations, features, and pricing tiers."
      >
        <Button size="sm" onClick={() => navigate("/plan/create")} className="w-full gap-1.5 px-3 sm:w-auto " disabled={isFetching}>
          <Plus className="size-4" /> Create Plan
        </Button>
      </PageHeader>

      <div className="table-container overflow-visible">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar className="relative z-40 overflow-visible p-5 border-b border-border/40">
            <h3 className="text-xs font-semibold  text-muted-foreground ">
              Billing Plans ({filteredPlans.length})
            </h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full sm:w-auto mt-3 sm:mt-0">
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
                disabled={isFetching} 
                placeholder="Search plans..." 
                className="w-full sm:w-64" 
              />
              <Select value={planTypeFilter} onValueChange={setPlanTypeFilter} disabled={isFetching}>
                <SelectTrigger className="h-9 w-full text-xs font-medium sm:w-44 bg-background/50">
                  <SelectValue placeholder="All Plan Types" />
                </SelectTrigger>
                <SelectContent align="end">
                  {[
                    ["all", `All Plan Types `],
                    ["basic", `Basic `],
                    ["free trial", `Free Trial `],
                  ].map(([v, l]) => (
                    <SelectItem key={v} value={v} className="cursor-pointer text-xs">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus} disabled={isFetching}>
                <SelectTrigger className="h-9 w-full text-xs font-medium sm:w-44 bg-background/50">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent align="end">
                  {[["all", "All Statuses"], ["active", "Active"], ["inactive", "Inactive"]].map(([v, l]) => (
                    <SelectItem key={v} value={v} className="cursor-pointer text-xs">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()} className="size-9 shrink-0 " disabled={isFetching}>
                <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </FilterBar>

          <DataTable
            data={filteredPlans}
            columns={columns}
            isLoading={isLoading || isFetching}
            enablePagination
            pageSize={10}
            totalItems={filteredPlans.length}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
            onRowClick={(plan) => navigate(`/plan/${plan.id}`)}
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
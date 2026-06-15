import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, AlertCircle, RefreshCw, Plus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable, type CustomColumnDef } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePlans } from "@/api/hooks/usePlans"
import { cn } from "@/lib/utils"
import type { Plan } from "@/types"
import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/search-input"

const normalizePlanType = (type: string) => {
  const lower = String(type).toLowerCase()
  return lower === "free trail" ? "free trial" : lower
}

const columns: CustomColumnDef<Plan>[] = [
  {
    accessorKey: "plan_type",
    header: "Plan Type",
    width: 140,
    cell: ({ row }) => <span className="text-xs font-semibold text-foreground">{row.original.plan_type}</span>,
  },
  {
    accessorKey: "price_per_invoice_amount",
    header: "Price",
    width: 140,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-foreground">
        {row.original.price_per_invoice_currency} {row.original.price_per_invoice_amount}
      </span>
    ),
  },
  {
    accessorKey: "plan_interval",
    header: "Interval",
    width: 120,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.plan_interval}</span>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    width: 100,
    cell: ({ row }) => {
      const active = row.original.is_active
      return (
        <Badge
          variant={active ? "secondary" : "outline"}
          className={active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "text-muted-foreground"}
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    width: 120,
    cell: ({ row }) => <span className="block truncate text-xs text-muted-foreground">{row.original.description}</span>,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    width: 140,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "N/A"}
      </span>
    ),
  },
]

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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="font-medium text-muted-foreground">Fetching subscription plans...</p>
    </div>
  )

  if (isError) return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
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
    </div>
  )

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
      <PageHeader
        title="Plans & Pricing"
        description="Manage your subscription configurations."
      >
        <Button size="sm" onClick={() => navigate("/plan/create")} className="w-full gap-1.5 px-3 sm:w-auto" disabled={isFetching}>
          <Plus className="size-4" /> Create Plan
        </Button>
      </PageHeader>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-border p-0">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={planTypeFilter} onValueChange={setPlanTypeFilter} className="gap-0">
              <TabsList className="h-9 rounded-md p-0.5">
                {[
                  { value: "all",        label: `All (${typeCounts.all})` },
                  { value: "basic",      label: `Basic (${typeCounts.basic})` },
                  { value: "free trial", label: `Free Trial (${typeCounts.freeTrial})` },
                ].map(({ value, label }) => (
                  <TabsTrigger key={value} value={value} className="h-7 cursor-pointer rounded-sm px-2.5 text-xs">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput value={searchText} onChange={setSearchText} disabled={isFetching} placeholder="Search plans..." className="w-full sm:w-72" />
              <Select value={status} onValueChange={setStatus} disabled={isFetching}>
                <SelectTrigger className="h-9 w-full sm:w-40"><SelectValue placeholder="All Plans" /></SelectTrigger>
                <SelectContent align="end">
                  {[["all", "All Plans"], ["active", "Active"], ["inactive", "Inactive"]].map(([v, l]) => (
                    <SelectItem key={v} value={v} className="cursor-pointer">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()} className="size-9 cursor-pointer" disabled={isFetching}>
                <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </div>

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
            emptyState={
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-primary/5 p-4 rounded-full mb-3 text-primary/80 border border-primary/10">
                  <CreditCard className="size-8 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {searchText || status !== "all" || planTypeFilter !== "all"
                    ? "No plans match filters"
                    : "No subscription plans"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                  {searchText || status !== "all" || planTypeFilter !== "all"
                    ? "We couldn't find any plans matching your search or filters. Try clearing them to see all plans."
                    : "Create your first billing plan to manage subscription configurations."}
                </p>
                {plans.length === 0 && (
                  <Button
                    onClick={() => navigate("/plan/create")}
                    className="mt-4 gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
                    disabled={isFetching}
                  >
                    <Plus className="size-3.5" /> Create Plan
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
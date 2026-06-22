import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, AlertCircle, RefreshCw, Plus, CreditCard, MoreVertical, Eye, Edit, Trash2, Layers, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, type CustomColumnDef } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePlans } from "@/api/hooks/usePlans"
import { cn } from "@/lib/utils"
import type { Plan } from "@/types"
import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/search-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  {
    id: "actions",
    header: "Actions",
    width: 80,
    cell: () => {
      return (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-45">
              <DropdownMenuItem disabled className="text-xs cursor-not-allowed opacity-50 gap-1.5">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-xs cursor-not-allowed opacity-50 gap-1.5">
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-xs cursor-not-allowed opacity-50 gap-1.5 text-red-600 focus:text-red-700">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
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
        description="Manage your subscription configurations, features, and pricing tiers."
      >
        <Button size="sm" onClick={() => navigate("/plan/create")} className="w-full gap-1.5 px-3 sm:w-auto cursor-pointer" disabled={isFetching}>
          <Plus className="size-4" /> Create Plan
        </Button>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card/60 backdrop-blur-xs p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-900/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/40 w-fit select-none">
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
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer select-none border border-transparent",
                      isActive 
                        ? "bg-primary/10 text-primary-700 border-primary/20 dark:bg-primary/20 dark:text-primary-300 dark:border-primary-900/50 "
                        : "text-muted-foreground hover:text-foreground hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{label}</span>
                    <span className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none",
                      isActive 
                        ? "bg-primary/20 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
                        : "bg-slate-200/60 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400"
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
                className="w-full sm:w-72 [&_input]:rounded-lg [&_input]:bg-background [&_input]:border-border/80 [&_input]:hover:border-slate-300 [&_input]:transition-colors s" 
              />
              <Select value={status} onValueChange={setStatus} disabled={isFetching}>
                <SelectTrigger className="h-9 w-full sm:w-44 border border-border/80 rounded-lg bg-background hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300 transition-colors text-xs font-medium cursor-pointer ">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl border border-border/80 shadow-md">
                  {[["all", "All Statuses"], ["active", "Active"], ["inactive", "Inactive"]].map(([v, l]) => (
                    <SelectItem key={v} value={v} className="cursor-pointer text-xs">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()} className="size-9 rounded-lg border-border/80 bg-background hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300 cursor-pointer shadow-xs transition-colors shrink-0" disabled={isFetching}>
                <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  )
}

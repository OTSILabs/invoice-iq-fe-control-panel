import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { usePlans } from "@/api/hooks/usePlans"
import type { Plan } from "@/types"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export function Plans() {
  const {
    data: plans = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePlans()
  const navigate = useNavigate()

  // State for search and filters
  const [searchText, setSearchText] = useState("")
  const [status, setStatus] = useState("all")
  const [planTypeFilter, setPlanTypeFilter] = useState("all")

  const columns = useMemo<CustomColumnDef<Plan>[]>(
    () => [
      {
        accessorKey: "plan_type",
        header: "Plan Type",
        width: 140,
        cell: ({ row }) => (
          <span className="font-semibold text-foreground ">
            {row.original.plan_type}
          </span>
        ),
      },
      {
        accessorKey: "price_per_invoice_amount",
        header: "Price",
        width: 140,
        cell: ({ row }) => (
          <span className="font-medium text-slate-600 ">
            {row.original.price_per_invoice_currency}{" "}
            {row.original.price_per_invoice_amount}
          </span>
        ),
      },
      {
        accessorKey: "plan_interval",
        header: "Interval",
        width: 120,
        cell: ({ row }) => (
          <span className="text-muted-foreground ">
            {row.original.plan_interval}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        width: 100,
        cell: ({ row }) => (
          <Badge
            variant={row.original.is_active ? "secondary" : "outline"}
            className={
              row.original.is_active
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 "
                : "text-muted-foreground"
            }
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        width: 120,
        cell: ({ row }) => (
          <span className="block truncate text-muted-foreground">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        width: 140,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.created_at
              ? new Date(row.original.created_at).toLocaleDateString()
              : "N/A"}
          </span>
        ),
      },
    ],
    []
  )

  // Status and search filtering
  const statusAndSearchFilteredPlans = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return plans.filter((plan) => {
      const isActive = plan.is_active !== false

      if (status === "active" && !isActive) return false
      if (status === "inactive" && isActive) return false

      if (!normalizedSearch) return true

      return [
        plan.plan_type,
        plan.plan_interval,
        plan.price_per_invoice_currency,
        String(plan.price_per_invoice_amount),
        plan.description,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    })
  }, [plans, searchText, status])

  // Helper to normalize plan type to handle spelling variations (e.g., Free Trail vs. Free Trial)
  const normalizePlanType = (type: string) => {
    const lower = String(type).toLowerCase()
    if (lower === "free trail" || lower === "free trial") {
      return "free trial"
    }
    return lower
  }

  // Tab counts calculation based on status & search filtering (All, Basic, Free Trial)
  const typeCounts = useMemo(() => {
    return statusAndSearchFilteredPlans.reduce(
      (counts, plan) => {
        counts.all += 1
        const type = normalizePlanType(plan.plan_type)
        if (type === "basic") {
          counts.basic += 1
        } else if (type === "free trial") {
          counts.freeTrial += 1
        }
        return counts
      },
      { all: 0, basic: 0, freeTrial: 0 }
    )
  }, [statusAndSearchFilteredPlans])

  // Tab filter
  const filteredPlans = useMemo(() => {
    return statusAndSearchFilteredPlans.filter((plan) => {
      if (planTypeFilter === "all") return true
      const type = normalizePlanType(plan.plan_type)
      return type === normalizePlanType(planTypeFilter)
    })
  }, [planTypeFilter, statusAndSearchFilteredPlans])

  // Loading Screen
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary " />
        <p className="font-medium text-muted-foreground ">
          Fetching subscription plans...
        </p>
      </div>
    )
  }

  // Error Screen
  if (isError) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-3 ">
          <AlertCircle className="h-8 w-8 text-red-600 " />
        </div>
        <div>
          <h2 className="text-xl font-bold">Failed to load plans</h2>
          <p className="mt-1 text-muted-foreground ">
            There was a connection issue. Please check your network and API
            config.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }


  // LIST STATE: Render list of plans in a clean table overview with filtering
  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground ">
            Plans & Pricing
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground ">
            Manage your subscription configurations.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            onClick={() => navigate("/plan/create")}
            className="gap-1.5 rounded-xl font-semibold"
          >
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        </div>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card p-0 ">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={planTypeFilter}
              onValueChange={setPlanTypeFilter}
              className="gap-0"
            >
              <TabsList className="h-9 rounded-md p-0.5">
                <TabsTrigger
                  value="all"
                  className="h-7 cursor-pointer rounded-sm px-2.5 text-xs"
                >
                  All ({typeCounts.all})
                </TabsTrigger>
                <TabsTrigger
                  value="basic"
                  className="h-7 cursor-pointer rounded-sm px-2.5 text-xs"
                >
                  Basic ({typeCounts.basic})
                </TabsTrigger>
                <TabsTrigger
                  value="free trial"
                  className="h-7 cursor-pointer rounded-sm px-2.5 text-xs"
                >
                  Free Trial ({typeCounts.freeTrial})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search plans..."
                className="h-9 w-full sm:w-72"
              />

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-full sm:w-40">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all" className="cursor-pointer">
                    All Plans
                  </SelectItem>
                  <SelectItem value="active" className="cursor-pointer">
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className="cursor-pointer">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                className="h-9 w-9 cursor-pointer"
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredPlans}
            columns={columns}
            isLoading={isLoading || isFetching}
            enablePagination={false}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mx-auto max-w-md space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground ">
                      No Plans Found
                    </h1>
                    <p className="mx-auto max-w-sm text-base text-muted-foreground ">
                      {searchText || status !== "all" || planTypeFilter !== "all"
                        ? "We couldn't find any plans matching your search or filters."
                        : "Create your first plan to get started."}
                    </p>
                  </div>
                  {plans.length === 0 && (
                    <Button
                      onClick={() => navigate("/plan/create")}
                      className="h-auto gap-2 rounded-xl px-6 py-5 text-base font-semibold"
                    >
                      Create Plan
                    </Button>
                  )}
                </div>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

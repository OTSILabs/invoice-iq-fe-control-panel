import { useState, useMemo } from "react"
import { Plus, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { format } from "date-fns"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useErpSettings } from "@/api/hooks/useErp"
import type { ErpSetting } from "@/types"
import { ErpSettingFormDialog } from "./erp-setting-form-dialog"

const SENSITIVE_KEYS = [
  "password",
  "pass",
  "pwd",
  "secret",
  "token",
  "access_token",
  "refresh_token",
  "api_key",
  "apikey",
  "auth",
  "authorization",
  "username",
  "user_name",
  "client_secret",
  "private_key",
]

const MASK_VALUE = "********"

function isSensitiveKey(key = "") {
  const normalized = String(key).toLowerCase()
  return SENSITIVE_KEYS.some((sensitiveKey) =>
    normalized.includes(sensitiveKey)
  )
}

function maskSensitiveSegmentsInString(rawValue = "") {
  if (typeof rawValue !== "string") return rawValue

  const hasSensitivePattern = SENSITIVE_KEYS.some((key) =>
    new RegExp(`\\b${key.replace(/_/g, "[_\\s-]?")}\\b\\s*[:=]`, "i").test(
      rawValue
    )
  )

  if (!hasSensitivePattern) {
    return rawValue
  }

  let maskedValue = rawValue
  SENSITIVE_KEYS.forEach((key) => {
    const keyPattern = key.replace(/_/g, "[_\\s-]?")
    maskedValue = maskedValue.replace(
      new RegExp(`(\\b${keyPattern}\\b\\s*[:=]\\s*)([^,;\\s]+)`, "gi"),
      `$1${MASK_VALUE}`
    )
  })

  return maskedValue
}

function maskJsonValues(value: unknown, key = ""): unknown {
  if (isSensitiveKey(key)) {
    return MASK_VALUE
  }

  if (Array.isArray(value)) {
    return value.map((item) => maskJsonValues(item, key))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([nestedKey, nestedValue]) => [
          nestedKey,
          maskJsonValues(nestedValue, nestedKey),
        ]
      )
    )
  }

  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === "string") {
    return maskSensitiveSegmentsInString(value)
  }

  return value
}

function getFormattedDate(value: string): string {
  try {
    return format(new Date(value), "dd MMM yyyy, hh:mm a")
  } catch {
    return "N/A"
  }
}

function MetaDateItem({
  label,
  value,
  align = "left",
}: {
  label: string
  value?: string | null
  align?: "left" | "right"
}) {
  if (!value) return null

  return (
    <div
      className={
        align === "right" ? "flex flex-col text-right" : "flex flex-col"
      }
    >
      <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-[11px] font-medium text-foreground">
        {getFormattedDate(value)}
      </span>
    </div>
  )
}

function JSONRenderer({ value }: { value: unknown }) {
  return (
    <pre className="h-48 scrollbar-thin overflow-auto rounded-md border border-slate-800 bg-slate-950 p-4 font-mono text-[12px] text-emerald-400 select-all">
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  )
}

export function ErpSettings() {
  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useErpSettings()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [erpTypeFilter, setErpTypeFilter] = useState("all")

  const settings = useMemo(() => data || [], [data])
  const usedErpTypes = useMemo(
    () => settings.map((s) => s.erp_type.toLowerCase()),
    [settings]
  )
  const allErpTypes = ["cw", "sap"]
  const isAllUsed = allErpTypes.every((type) => usedErpTypes.includes(type))

  const filteredSettings = useMemo(() => {
    return settings.filter((record) => {
      const isEnabled = record.is_enabled !== false
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "enabled" && isEnabled) ||
        (statusFilter === "disabled" && !isEnabled)

      const typeMatch =
        erpTypeFilter === "all" ||
        record.erp_type.toLowerCase() === erpTypeFilter.toLowerCase()

      return statusMatch && typeMatch
    })
  }, [settings, statusFilter, erpTypeFilter])

  const handleRefetch = async () => {
    await refetch()
    toast.success("ERP Settings refreshed")
  }

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            ERP Settings
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Configure and maintain enterprise ERP integrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-30 bg-background">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All Status
              </SelectItem>
              <SelectItem value="enabled" className="cursor-pointer">
                Enabled
              </SelectItem>
              <SelectItem value="disabled" className="cursor-pointer">
                Disabled
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={erpTypeFilter} onValueChange={setErpTypeFilter}>
            <SelectTrigger className="h-9 w-30 bg-background">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All Types
              </SelectItem>
              <SelectItem value="cw" className="cursor-pointer">
                CW
              </SelectItem>
              <SelectItem value="sap" className="cursor-pointer">
                SAP
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefetch}
            className="h-9 w-9 shrink-0 cursor-pointer"
          >
            <RefreshCw
              className={isFetching ? "size-4 animate-spin" : "size-4"}
            />
          </Button>

          {!isAllUsed && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="shrink-0 gap-1.5 rounded-xl font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add ERP Setting
            </Button>
          )}
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-950/40">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Failed to load ERP settings</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              There was a connection issue. Please check your network and API
              config.
            </p>
          </div>
          <Button onClick={handleRefetch} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : (
        <ErpSettingsCards records={filteredSettings} />
      )}

      <ErpSettingFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        usedErpTypes={usedErpTypes}
      />
    </div>
  )
}

function ErpSettingsCards({ records }: { records: ErpSetting[] }) {
  if (!records.length) {
    return (
      <Card className="w-full border border-border p-6 text-center shadow-sm">
        <CardHeader>
          <CardTitle>No ERP settings found</CardTitle>
          <CardDescription>
            Create your first ERP integration config to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid animate-in gap-4 duration-200 fade-in md:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => {
        const isEnabled = record.is_enabled !== false
        const displayName =
          record.display_name || `${record.erp_type.toUpperCase()} Integration`

        return (
          <Card
            key={record.erp_id}
            className="flex h-full flex-col overflow-hidden border-border/80 shadow-sm"
          >
            <CardHeader className="border-b bg-muted/10 p-5 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base font-bold text-slate-800 dark:text-slate-100">
                    {displayName}
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs font-semibold tracking-wider text-primary uppercase">
                    {record.erp_type}
                  </CardDescription>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <Switch checked={isEnabled} disabled className="opacity-75" />
                </div>
              </div>
              <div className="mt-3 flex items-start justify-between gap-4 border-t border-slate-100 pt-2 dark:border-slate-800">
                <MetaDateItem label="Created" value={record.created_at} />
                <MetaDateItem
                  label="Updated"
                  value={record.updated_at}
                  align="right"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-4">
              <JSONRenderer value={maskJsonValues(record.settings || {})} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

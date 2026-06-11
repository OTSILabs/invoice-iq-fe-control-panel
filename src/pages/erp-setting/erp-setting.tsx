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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { format } from "date-fns"

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
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground/80 uppercase">
        {label}
      </span>
      <span className="text-xs font-medium text-foreground/85">
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

  const settings = useMemo(() => data || [], [data])
  const usedErpTypes = useMemo(
    () => settings.map((s) => s.erp_type.toLowerCase()),
    [settings]
  )

  const handleRefetch = async () => {
    await refetch()
    toast.success("ERP Settings refreshed")
  }

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 ">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">ERP Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure and maintain enterprise ERP integrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

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

     
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto font-medium px-3 shadow-none shrink-0 gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add ERP Setting
            </Button>
         
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Failed to load ERP settings</h2>
            <p className="mt-1 text-muted-foreground">
              There was a connection issue. Please check your network and API
              config.
            </p>
          </div>
          <Button onClick={handleRefetch} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : (
        <ErpSettingsCards records={settings} />
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
      <Card className="w-full border border-border p-6 text-center">
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
    <div className="grid animate-in gap-4 duration-200 fade-in sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {records.map((record) => {
        const displayName =
          record.display_name || `${record.erp_type.toUpperCase()} Integration`

        return (
          <Card
            key={record.erp_id}
            className="flex h-full flex-col overflow-hidden border-border/80"
          >
            <CardHeader className="border-b bg-muted/10  pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base font-semibold text-foreground">
                    {displayName}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs font-medium tracking-wider text-primary/80 uppercase">
                    {record.erp_type}
                  </CardDescription>
                </div>
              </div>
              <div className="mt-3 flex items-start justify-between gap-4 border-t border-slate-100 pt-2">
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

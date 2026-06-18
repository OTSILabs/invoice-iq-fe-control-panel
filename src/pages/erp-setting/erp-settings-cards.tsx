import { useState } from "react"
import { format } from "date-fns"
import { Edit2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import type { ErpSetting } from "@/types"

const SENSITIVE_KEYS = [
  "password", "pass", "pwd", "secret", "token", "access_token", "refresh_token",
  "api_key", "apikey", "auth", "authorization", "username", "user_name",
  "client_secret", "private_key",
]
const MASK_VALUE = "********"

const isSensitiveKey = (key = "") =>
  SENSITIVE_KEYS.some((k) => String(key).toLowerCase().includes(k))

function maskSensitiveSegmentsInString(val = "") {
  if (typeof val !== "string") return val
  SENSITIVE_KEYS.forEach((key) => {
    const pattern = new RegExp(`(\\b${key.replace(/_/g, "[_\\s-]?")}\\b\\s*[:=]\\s*)([^,;\\s]+)`, "gi")
    val = val.replace(pattern, `$1${MASK_VALUE}`)
  })
  return val
}

function maskJsonValues(val: unknown, key = ""): unknown {
  if (isSensitiveKey(key)) return MASK_VALUE
  if (Array.isArray(val)) return val.map((item) => maskJsonValues(item, key))
  if (val && typeof val === "object") {
    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [k, maskJsonValues(v, k)])
    )
  }
  return typeof val === "string" ? maskSensitiveSegmentsInString(val) : val
}

const getFormattedDate = (value: string) => {
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
    <div className={align === "right" ? "flex flex-col text-right" : "flex flex-col"}>
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground/80 uppercase">
        {label}
      </span>
      <span className="text-xs font-medium text-foreground/85">
        {getFormattedDate(value)}
      </span>
    </div>
  )
}

const JSONRenderer = ({ value }: { value: unknown }) => (
  <pre className="h-48 scrollbar-thin overflow-auto rounded-md border border-slate-800 bg-slate-950 p-4 font-mono text-[12px] text-emerald-400 select-all">
    <code>{JSON.stringify(value, null, 2)}</code>
  </pre>
)

function ErpSettingCard({
  record,
  onEdit,
  onDelete,
}: {
  record: ErpSetting
  onEdit: (record: ErpSetting) => void
  onDelete: (record: ErpSetting) => void
}) {
  const [isEnabled, setIsEnabled] = useState(Boolean(record.is_enabled ?? true))

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base font-semibold text-foreground">
              {record.display_name || `${record.erp_type.toUpperCase()} Integration`}
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs font-medium tracking-wider text-primary/80 uppercase">
              {record.erp_type}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {isEnabled ? "Enabled" : "Disabled"}
            </span>
            <Switch
              checked={isEnabled}
              disabled
              onCheckedChange={(checked) => {
                setIsEnabled(checked)
                toast.success(`ERP setting ${checked ? "enabled" : "disabled"} successfully!`)
              }}
            />
          </div>
        </div>
        <div className="mt-3 flex items-start justify-between gap-4 border-t border-slate-100 pt-2">
          <MetaDateItem label="Created" value={record.created_at} />
          <MetaDateItem label="Updated" value={record.updated_at} align="right" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <div className={`transition-all duration-200 ${isEnabled ? "" : "blur-[2px] opacity-70"}`}>
          <JSONRenderer value={maskJsonValues(record.settings || {})} />
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/5 p-4 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(record)} className="gap-1.5 text-xs" disabled>
          <Edit2 className="size-3.5" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(record)} className="gap-1.5 text-xs" disabled>
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ErpSettingsCards({
  records,
  onEdit,
  onDelete,
}: {
  records: ErpSetting[]
  onEdit: (record: ErpSetting) => void
  onDelete: (record: ErpSetting) => void
}) {
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
    <div className="grid animate-in gap-4 duration-200 fade-in sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <ErpSettingCard
          key={record.erp_id}
          record={record}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

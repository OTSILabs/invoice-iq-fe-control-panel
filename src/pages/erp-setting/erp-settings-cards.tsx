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
import { EmptyState } from "@/components/invoice-ui/design-system"

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
  <pre className="scrollbar-thin h-48 overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-[12px] text-emerald-300 shadow-inner ring-1 ring-white/10 select-all">
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
    <Card className="surface-card flex h-full flex-col overflow-hidden p-0">
      <CardHeader className="border-b border-border/60 bg-muted/15 p-5">
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
        <div className="mt-3 flex items-start justify-between gap-4 rounded-lg bg-muted/35 p-3 ring-1 ring-border/45">
          <MetaDateItem label="Created" value={record.created_at} />
          <MetaDateItem label="Updated" value={record.updated_at} align="right" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <div className={`transition-all duration-200 ${isEnabled ? "" : "blur-[2px] opacity-70"}`}>
          <JSONRenderer value={maskJsonValues(record.settings || {})} />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 p-4">
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
      <EmptyState
        title="No ERP settings found"
        description="Create your first ERP integration config to get started."
      />
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

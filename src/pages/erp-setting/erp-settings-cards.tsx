import { useState } from "react"
import { format } from "date-fns"
import {  Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import type { ErpSetting } from "@/types"
import { EmptyState } from "@/components/invoice-ui/design-system"

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

const isSensitiveKey = (key = "") =>
  SENSITIVE_KEYS.some((k) => String(key).toLowerCase().includes(k))

function maskSensitiveSegmentsInString(val = "") {
  if (typeof val !== "string") return val
  SENSITIVE_KEYS.forEach((key) => {
    const pattern = new RegExp(
      `(\\b${key.replace(/_/g, "[_\\s-]?")}\\b\\s*[:=]\\s*)([^,;\\s]+)`,
      "gi"
    )
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
    return format(new Date(value), "dd MMM yyyy")
  } catch {
    return "N/A"
  }
}

const JSONRenderer = ({ value }: { value: unknown }) => (
  <pre className="h-32 scrollbar-thin overflow-y-auto rounded-lg border border-zinc-900 bg-black p-3.5 font-mono text-[11px] break-all whitespace-pre-wrap text-emerald-400 select-all">
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
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card p-0 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md">
      <CardHeader className="border-b border-border/40 bg-muted/5 p-3 ">
        <div className="flex items-start justify-between gap-3 min-w-0 w-full">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-sm font-semibold tracking-tight text-foreground">
              {record.display_name ||
                `${record.erp_type.toUpperCase()} Integration`}
            </CardTitle>
            <div className="mt-1 flex items-center">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary ring-1 ring-inset ring-primary/20">
                {record.erp_type}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-muted-foreground">
              {isEnabled ? "Enabled" : "Disabled"}
            </span>
            <Switch
              checked={isEnabled}
              disabled
              className="scale-75"
              onCheckedChange={(checked) => {
                setIsEnabled(checked)
                toast.success(
                  `ERP setting ${checked ? "enabled" : "disabled"} successfully!`
                )
              }}
            />
          </div>
        </div>
        <div className=" flex items-center justify-between text-[10px] text-muted-foreground/75">
          <span>
            Created:
            {record.created_at ? getFormattedDate(record.created_at) : "N/A"}
          </span>
          <span>
            Updated:
            {record.updated_at ? getFormattedDate(record.updated_at) : "N/A"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 py-1">
        <div
          className={`transition-all duration-200 ${isEnabled ? "" : "opacity-70 blur-[2px]"}`}
        >
          <JSONRenderer value={maskJsonValues(record.settings || {})} />
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 border-t border-border/40 pb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(record)}
          className="h-8 flex-1 text-xs"
          disabled
        >
          {/* <Edit2 className="size-3" /> */}
          Edit
        </Button>

        <Button
          variant="destructive"
         size="sm"
          onClick={() => onDelete(record)}
          className="h-8 w-8"
          disabled
        >
          <Trash2 className="size-3" />
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
    <div className="grid animate-in gap-4 duration-200 fade-in sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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

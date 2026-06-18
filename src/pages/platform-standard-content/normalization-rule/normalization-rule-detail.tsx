import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ShieldCheck, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNormalizationRule, useDeleteNormalizationRuleMutation } from "@/api/hooks/normalization-rules"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}

export function NormalizationRuleDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const { data: rule, isLoading, isError } = useNormalizationRule(code || "")
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteNormalizationRuleMutation()

  const handleDelete = () => {
    if (!code) return
    deleteRule(code, {
      onSuccess: () => {
        toast.success(`Normalization rule "${rule?.display_label || code}" deleted successfully!`)
        setConfirmDeleteOpen(false)
        navigate("/platform-standard-content/normalization-rules")
      },
      onError: (err: unknown) => {
        let errMsg = "Failed to delete normalization rule."
        const axiosErr = err as { response?: { data?: { message?: unknown } } }
        if (axiosErr.response?.data?.message) {
          errMsg = String(axiosErr.response.data.message)
        } else if (err instanceof Error) {
          errMsg = err.message
        }
        toast.error(errMsg)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isError || !rule) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
        <p className="text-sm text-muted-foreground">Failed to load normalization rule details.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/platform-standard-content/normalization-rules")}
        >
          Back to Normalization Rules
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Normalization Rule Details</h1>
          <p className="text-xs text-muted-foreground">View details, target scopes, and schema configurations for this normalization rule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-medium gap-1.5 border-border shadow-sm cursor-pointer"
            onClick={() => navigate("/platform-standard-content/normalization-rules")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="font-medium gap-1.5 cursor-pointer shadow-sm"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Details Card */}
      <div className="w-full">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />
          
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate" title={rule.display_label}>
                  {rule.display_label}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">
                  {rule.rule_code}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
            {[
              {
                label: "Code",
                content: (
                  <p className="font-mono text-xs font-semibold text-foreground truncate" title={rule.rule_code}>
                    {rule.rule_code}
                  </p>
                )
              },
              {
                label: "Display Label",
                content: <p className="text-xs font-semibold text-foreground">{rule.display_label}</p>
              },
              {
                label: "Rule Mode",
                content: (
                  <Badge variant="outline" className="text-xxs px-2 py-0.5 font-mono uppercase bg-slate-50 border-slate-200">
                    {rule.rule_mode}
                  </Badge>
                )
              },
              {
                label: "Engine Type",
                content: (
                  <p className="font-mono text-xs font-semibold text-foreground truncate" title={rule.engine_type || "—"}>
                    {rule.engine_type || "—"}
                  </p>
                )
              },
              {
                label: "Implementation Key",
                content: (
                  <p className="font-mono text-xs font-semibold text-foreground truncate" title={rule.implementation_key || "—"}>
                    {rule.implementation_key || "—"}
                  </p>
                )
              },
              {
                label: "Sort Sequence",
                content: <p className="text-xs font-semibold text-foreground">{rule.sort_sequence ?? "—"}</p>
              },
              {
                label: "Status",
                content: (
                  <Badge
                    variant={rule.is_active ? "secondary" : "outline"}
                    className={rule.is_active ? "text-xxs px-2 py-0.5 border-emerald-200 bg-emerald-50 text-emerald-700" : "text-xxs px-2 py-0.5 text-muted-foreground"}
                  >
                    {rule.is_active ? "Active" : "Inactive"}
                  </Badge>
                )
              },
              {
                label: "Created At",
                content: <p className="text-xs font-semibold text-foreground">{formatDate(rule.created_at)}</p>
              },
              {
                label: "Updated At",
                content: <p className="text-xs font-semibold text-foreground">{formatDate(rule.updated_at)}</p>
              }
            ].map((item) => (
              <div key={item.label} className="bg-card px-5 py-4 hover:bg-muted/10 transition-colors flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                {item.content}
              </div>
            ))}
          </div>

          <div className="bg-card px-5 py-4 border-t border-border flex flex-col gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {rule.description || "No description provided."}
            </p>
          </div>

          <div className="bg-card px-5 py-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6 md:divide-x md:divide-border">
            <div className="flex flex-col gap-2 pb-2 md:pb-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Supported Data Types</p>
              <div className="flex flex-wrap gap-1.5">
                {rule.supported_data_types_json && rule.supported_data_types_json.length > 0 ? (
                  rule.supported_data_types_json.map((dt) => (
                    <Badge key={dt} variant="secondary" className="text-[10px] font-mono font-medium px-2 py-0.5 uppercase">
                      {dt}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 md:pl-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Supported Header Items</p>
              <div className="flex flex-wrap gap-1.5">
                {rule.supported_header_items_json && rule.supported_header_items_json.length > 0 ? (
                  rule.supported_header_items_json.map((hi) => (
                    <Badge key={hi} variant="secondary" className="text-[10px] font-mono font-medium px-2 py-0.5 uppercase">
                      {hi}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card px-5 py-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30">
            <div className="flex flex-col gap-2 h-full">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parameter Schema</p>
              <pre className="flex-1 p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] overflow-x-auto min-h-[120px] max-h-72 border border-slate-800 shadow-inner">
                {JSON.stringify(rule.parameter_schema_json, null, 2)}
              </pre>
            </div>

            <div className="flex flex-col gap-2 h-full">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Engine Configuration</p>
              <pre className="flex-1 p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] overflow-x-auto min-h-[120px] max-h-72 border border-slate-800 shadow-inner">
                {JSON.stringify(rule.engine_config_json, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {confirmDeleteOpen && (
        <Dialog open={confirmDeleteOpen} onOpenChange={(open) => !open && setConfirmDeleteOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Normalization Rule</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the normalization rule <strong>{rule?.rule_code || code}</strong>?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <p className="text-xs text-muted-foreground">
                Deleting this normalization rule is permanent and cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm cursor-pointer"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

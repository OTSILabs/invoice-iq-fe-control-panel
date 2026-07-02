import { PageMetadata } from "@/components/layout/PageMetadata"
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ShieldCheck, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useValidationRule, useDeleteValidationRuleMutation } from "@/api/hooks/validation-rules"
import { ActiveStatusBadge } from "@/columns"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SemanticBadge } from "@/components/invoice-ui/design-system"
import { DetailGrid } from "@/components/ui/detail-grid"
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

export function ValidationRuleDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const { data: rule, isLoading, isError } = useValidationRule(code || "")
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteValidationRuleMutation()

  const handleDelete = () => {
    if (!code) return
    deleteRule(code, {
      onSuccess: () => {
        toast.success(`Validation rule "${rule?.display_label || code}" deleted successfully!`)
        setConfirmDeleteOpen(false)
        navigate("/platform-standard-content/validation-rules")
      },
      onError: (err: unknown) => {
        let errMsg = "Failed to delete validation rule."
        const axiosErr = err as { response?: { data?: { detail?: unknown; message?: unknown } } }
        if (axiosErr.response?.data?.detail) {
          errMsg = String(axiosErr.response.data.detail)
        } else if (axiosErr.response?.data?.message) {
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
      <PageShell className="min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </PageShell>
    )
  }

  if (isError || !rule) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load validation rule details.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/platform-standard-content/validation-rules")}
        >
          Back to Validation Rules
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageMetadata title="Validation Rule Details" description="Configure validation expressions and check bounds." keywords="validation rules, field constraints, quality checks" />
      {/* Header */}
      <PageHeader
        title="Validation Rule Details"
        description="View details, target scopes, and schema configurations for this validation rule."
      >
          <Button
            variant="outline"
            size="sm"
            className="font-medium gap-1.5 border-border shadow-sm cursor-pointer"
            onClick={() => navigate("/platform-standard-content/validation-rules")}
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
      </PageHeader>

      {/* Details Card */}
      <div className="surface-card w-full overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-snug text-foreground" title={rule.display_label}>
                  {rule.display_label}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">
                  {rule.rule_code}
                </p>
              </div>
            </div>
          </div>

          <DetailGrid cols={3}>
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
                  <SemanticBadge tone="neutral" className="font-mono ">
                    {rule.rule_mode}
                  </SemanticBadge>
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
                  <ActiveStatusBadge active={rule.is_active} className="text-xxs px-2 py-0.5" />
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
              <DetailGrid.Item key={item.label} label={item.label}>
                {item.content}
              </DetailGrid.Item>
            ))}
          </DetailGrid>

          <div className="flex flex-col gap-1.5 border-t border-border/45 bg-card px-5 py-4">
            <p className="text-xs font-bold  text-muted-foreground">Description</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {rule.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-border/45 bg-card px-5 py-5 md:grid-cols-2">
            <div className="flex flex-col gap-2 pb-2 md:pb-0">
              <p className="text-xs font-bold  text-muted-foreground">Supported Data Types</p>
              <div className="flex flex-wrap gap-1.5">
                {rule.supported_data_types_json && rule.supported_data_types_json.length > 0 ? (
                  rule.supported_data_types_json.map((dt) => (
                    <SemanticBadge key={dt} tone="accent" className="font-mono ">
                      {dt}
                    </SemanticBadge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold  text-muted-foreground">Supported Header Items</p>
              <div className="flex flex-wrap gap-1.5">
                {rule.supported_header_items_json && rule.supported_header_items_json.length > 0 ? (
                  rule.supported_header_items_json.map((hi) => (
                    <SemanticBadge key={hi} tone="accent" className="font-mono ">
                      {hi}
                    </SemanticBadge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-border/45 bg-muted/20 px-5 py-5 md:grid-cols-2">
            <div className="flex flex-col gap-2 h-full">
              <p className="text-xs font-bold  text-muted-foreground">Parameter Schema</p>
              <pre className="min-h-[120px] max-h-72 flex-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-[10px] text-slate-100 shadow-inner">
                {JSON.stringify(rule.parameter_schema_json, null, 2)}
              </pre>
            </div>

            <div className="flex flex-col gap-2 h-full">
              <p className="text-xs font-bold  text-muted-foreground">Engine Configuration</p>
              <pre className="min-h-[120px] max-h-72 flex-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-[10px] text-slate-100 shadow-inner">
                {JSON.stringify(rule.engine_config_json, null, 2)}
              </pre>
            </div>
          </div>
      </div>

      {confirmDeleteOpen && (
        <Dialog open={confirmDeleteOpen} onOpenChange={(open) => !open && setConfirmDeleteOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Validation Rule</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the validation rule <strong>{rule?.rule_code || code}</strong>?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <p className="text-xs text-muted-foreground">
                Deleting this validation rule is permanent and cannot be undone.
              </p>
            </div>
            <DialogFooter className="dialog-form-footer">
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
                variant="destructive"
                className="cursor-pointer"
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
    </PageShell>
  )
}
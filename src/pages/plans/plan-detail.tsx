import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CreditCard, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlan, useDeletePlanMutation } from "@/api/hooks/usePlans"
import { ActiveStatusBadge } from "@/components/invoice-ui/active-status-badge"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell } from "@/components/invoice-ui/design-system"
import { DetailGrid } from "@/components/ui/detail-grid"
import { toast } from "sonner"
import { formatDateTime } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const { data: plan, isLoading, isError } = usePlan(id || "")
  const { mutate: deletePlan, isPending: isDeleting } = useDeletePlanMutation()

  const handleDelete = () => {
    deletePlan(id || "", {
      onSuccess: () => {
        toast.success("Plan deleted successfully!")
        setConfirmDeleteOpen(false)
        navigate("/plan")
      },
      onError: (err: any) => {
        console.error(err)
        toast.error(err?.response?.data?.detail || "Failed to delete plan.")
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

  if (isError || !plan) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load subscription plan details.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/plan")}
        >
          Back to Plans
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title="Plan Details"
        description="View configuration details, limits, and interval configuration for this billing plan."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-medium gap-1.5 border-border "
            onClick={() => navigate("/plan")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            size="sm"
            className="font-medium gap-1.5"
            onClick={() => navigate(`/plan/${plan.id}/edit`)}
          >
            Edit Plan
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="font-medium gap-1.5"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete Plan
          </Button>
        </div>
      </PageHeader>

      {/* Details Card */}
      <div className="surface-card w-full overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-snug text-foreground" title={plan.description}>
                {plan.description || "Subscription Plan"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate font-mono">
                {plan.id}
              </p>
            </div>
          </div>
        </div>

        <DetailGrid cols={3}>
          {[
            {
              label: "Plan ID",
              content: (
                <p className="font-mono text-xs font-semibold text-foreground truncate" title={plan.id}>
                  {plan.id}
                </p>
              )
            },
            {
              label: "Plan Type",
              content: <p className="text-xs font-semibold text-foreground">{plan.plan_type || "—"}</p>
            },
            {
              label: "Plan Interval",
              content: <p className="text-xs font-semibold text-foreground">{plan.plan_interval || "—"}</p>
            },
            {
              label: "Price Per Invoice",
              content: (
                <p className="text-xs font-semibold text-foreground">
                  {plan.price_per_invoice_amount ?? 0} {plan.price_per_invoice_currency || ""}
                </p>
              )
            },
            {
              label: "Status",
              content: (
                <ActiveStatusBadge active={plan.is_active} className="text-xxs px-2 py-0.5 font-semibold border w-fit" />
              )
            },
            {
              label: "Created At",
              content: <p className="text-xs font-semibold text-foreground">{formatDateTime(plan.created_at, "—")}</p>
            }
          ].map((item) => (
            <DetailGrid.Item key={item.label} label={item.label}>
              {item.content}
            </DetailGrid.Item>
          ))}
        </DetailGrid>
      </div>

      {confirmDeleteOpen && (
        <Dialog open={confirmDeleteOpen} onOpenChange={(open) => !open && setConfirmDeleteOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Plan</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the plan <strong>{plan.plan_type} - {plan.description}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageShell>
  )
}

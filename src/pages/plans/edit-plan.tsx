import { PageMetadata } from "@/components/layout/PageMetadata"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"
import { PlanForm } from "./plan-form"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { usePlan } from "@/api/hooks/usePlans"

export function EditPlan() {
  const { id = "" } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: plan, isLoading, isError } = usePlan(id)

  const onDone = () => navigate(`/plan/${id}`)
  const onCancel = () => navigate(`/plan/${id}`)

  if (isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isError || !plan) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Failed to load subscription plan.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate("/plan")}>
          Back to Plans
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageMetadata
        title="Edit Plan"
        description="Modify pricing plan details, active status, and billing configuration."
        keywords="edit plan, billing, pricing"
      />
      <PageHeader
        title="Edit Plan"
        description="Update the configuration for this billing plan."
      >
        <Button variant="outline" size="sm" onClick={onDone}>
          <ArrowLeft className="size-4" /> Back to Plan Details
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Plan configuration
          </span>
        }
      >
        <PlanForm
          mode="edit"
          plan={plan}
          onSuccess={onDone}
          onCancel={onCancel}
        />
      </SectionCard>
    </PageShell>
  )
}

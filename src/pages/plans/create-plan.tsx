import { useNavigate } from "react-router-dom"
import { ArrowLeft, CreditCard } from "lucide-react"
import { PlanForm } from "./plan-form"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"

export function CreatePlan() {
  const navigate = useNavigate()
  const onDone = () => navigate("/plan")

  return (
    <PageShell>
      <PageHeader
        title="Create Plan"
        description="Provide the required specifications to set up the billing plan."
      >
        <Button variant="outline" size="sm" onClick={onDone}>
          <ArrowLeft className="size-4" /> Back to Plans
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
        <PlanForm mode="create" onSuccess={onDone} onCancel={onDone} />
      </SectionCard>
    </PageShell>
  )
}

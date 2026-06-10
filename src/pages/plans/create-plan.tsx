import { useNavigate } from "react-router-dom"
import { CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanForm } from "./modals/plan-form-dailog"

export function CreatePlan() {
  const navigate = useNavigate()
  const onDone = () => navigate("/plan")

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full animate-in items-center justify-center px-4 py-8 duration-300 fade-in">
      <Card className="w-full rounded-xl border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="size-5 text-primary" />
            Create Plan
          </CardTitle>
          <CardDescription>
            Provide the required specifications to set up the billing plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <PlanForm mode="create" onSuccess={onDone} onCancel={onDone} />
        </CardContent>
      </Card>
    </div>
  )
}
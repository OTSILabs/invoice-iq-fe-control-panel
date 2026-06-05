import { useNavigate } from "react-router-dom"
import { CreditCard } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlanForm } from "@/pages/plans/plan-form-dialog"

export function CreatePlan() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full animate-in items-center justify-center px-4 py-8 duration-300 fade-in">
      <Card className="w-full max-w-md rounded-xl border border-border bg-card">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="h-5 w-5 text-primary" />
            Create Plan
          </CardTitle>
          <CardDescription>
            Provide the required specifications to set up the billing plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <PlanForm
            mode="create"
            onSuccess={() => navigate("/plan")}
            onCancel={() => navigate("/plan")}
          />
        </CardContent>
      </Card>
    </div>
  )
}

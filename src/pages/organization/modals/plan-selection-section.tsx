import { Button } from "@/components/ui/button"
import { InputField } from "../../../components/ui/input-field"
import { Plus, Minus, ArrowLeft } from "lucide-react"
import { useFormContext } from "react-hook-form"
import type { Plan } from "@/types"
import { PlanForm } from "@/pages/plans/modals/plan-form-dailog"

interface PlanSelectionSectionProps {
  plans?: Plan[]
  isPlansLoading: boolean
  isCreatingPlan: boolean
  setIsCreatingPlan: (value: boolean) => void
  handleInlinePlanSuccess: (newPlan?: { id?: string } | null) => void
}

export function PlanSelectionSection({
  plans,
  isPlansLoading,
  isCreatingPlan,
  setIsCreatingPlan,
  handleInlinePlanSuccess,
}: PlanSelectionSectionProps) {
  const { register, setValue } = useFormContext()

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div>
        <h3 className="mb-1 text-base font-bold text-foreground">
          3. Plan Selection
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose a billing tier for this organization.
        </p>
      </div>
      <div className="space-y-2">
        <InputField
          id="planSelect"
          type="select"
          disabled={isCreatingPlan}
          label={
            <div className="flex items-center justify-between w-full">
              <span>
                Select Plan
                <span className="text-destructive ml-0.5">*</span>
              </span>
              {isCreatingPlan ? (
                <Button
                  type="button"
                  variant="text"
                  size="xs"
                  className="text-primary hover:text-primary/80"
                  onClick={() => setIsCreatingPlan(false)}
                >
                  <ArrowLeft className="mr-1 h-3 w-3" /> Select Plan
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="text"
                  size="xs"
                  className="text-primary hover:text-primary/80"
                  onClick={() => {
                    setValue("plan_id", "")
                    setIsCreatingPlan(true)
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Plan
                </Button>
              )}
            </div>
          }
          {...register("plan_id")}
        >
          <option value="" disabled>
            {isPlansLoading ? "Loading plans..." : "Select a plan"}
          </option>
          {plans?.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.description}
            </option>
          ))}
        </InputField>
      </div>

      {isCreatingPlan && (
        <div className="mt-4 animate-in border-t border-border pt-6 duration-300 fade-in slide-in-from-bottom-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h4 className="mb-1 text-sm font-bold text-foreground">
                Create New Plan
              </h4>
              <p className="text-xs text-muted-foreground">
                Add a new plan to the system. It will be
                automatically available to select once created.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              onClick={() => setIsCreatingPlan(false)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          <PlanForm
            formId="inline-plan-form"
            showFooter={false}
            onCancel={() => setIsCreatingPlan(false)}
            onSuccess={handleInlinePlanSuccess}
          />
        </div>
      )}
    </div>
  )
}

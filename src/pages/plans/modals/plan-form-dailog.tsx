import { useForm, Controller } from "react-hook-form"
import {  Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { InputField } from "@/components/ui/input-field"
import { Label } from "@/components/ui/label"
import { useCreatePlanMutation } from "@/api/hooks/usePlans"
import type { Plan } from "@/types"
import {
  planSchema,
  type PlanFormValues as FormValues,
  DEFAULT_PLAN_VALUES,
} from "@/schemas/plan-schema"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFormProps {
  onSuccess?: (data?: Plan) => void
  onCancel?: () => void
  mode?: "create" | "edit"
  plan?: Plan | null
  showFooter?: boolean
  formId?: string
}



// ─── PlanForm ─────────────────────────────────────────────────────────────────

export function PlanForm({
  onSuccess,
  onCancel,
  mode = "create",
  plan = null,
  showFooter = true,
  formId = "plan-form-inner",
}: PlanFormProps) {
  const createPlan = useCreatePlanMutation()

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: DEFAULT_PLAN_VALUES(plan),
  })

  const onSubmit = async (data: FormValues) => {
    try {
      if (mode === "create") {
        const created = await createPlan.mutateAsync({
          description:                data.description,
          plan_type:                  data.plan_type,
          plan_interval:              data.plan_interval,
          price_per_invoice_amount:   Number(data.price_per_invoice_amount),
          price_per_invoice_currency: data.price_per_invoice_currency,
          is_active:                  data.is_active,
        })
        toast.success("Plan created successfully!")
        reset()
        onSuccess?.(created)
      } else {
        toast.info("Edit plan is not implemented yet.")
        onSuccess?.()
      }
    } catch (error) {
      console.error(error)
      toast.error(`Failed to ${mode} plan.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

      {/* Description — full width */}
      <div className="space-y-1">
        <InputField
          id="description"
          label="Description"
          required
          error={errors.description?.message}
          placeholder="e.g. Starter tier for basic users"
          {...register("description")}
        />
      </div>

      {/* Plan Type + Plan Interval — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <InputField
            id="plan_type"
            label="Plan Type"
            type="select"
            required
            error={errors.plan_type?.message}
            {...register("plan_type")}
          >
            <option value="Basic">Basic</option>
            <option value="Free Trial">Free Trial</option>
          </InputField>
        </div>

        <div className="space-y-1">
          <InputField
            id="plan_interval"
            label="Plan Interval"
            type="select"
            required
            error={errors.plan_interval?.message}
            {...register("plan_interval")}
          >
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </InputField>
        </div>
      </div>

      {/* Price + Currency — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <InputField
            id="price_per_invoice_amount"
            label="Price Per Invoice"
            type="number"
            step="0.01"
            min="0"
            required
            error={errors.price_per_invoice_amount?.message}
            {...register("price_per_invoice_amount")}
          />
        </div>

        <div className="space-y-1">
          <InputField
            id="price_per_invoice_currency"
            label="Currency"
            type="select"
            required
            error={errors.price_per_invoice_currency?.message}
            {...register("price_per_invoice_currency")}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </InputField>
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div>
          <Label htmlFor="is_active" className="font-medium text-foreground">Active</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Plan is immediately available after saving</p>
        </div>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Switch
              id="is_active"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-primary"
            />
          )}
        />
      </div>

      {/* Footer buttons */}
      {showFooter && (
        <div className="flex gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-1/2"
            onClick={onCancel}
            disabled={createPlan.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-1/2 font-medium"
            disabled={createPlan.isPending}
          >
            {createPlan.isPending
              ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>
              : "Save Plan"
            }
          </Button>
        </div>
      )}
    </form>
  )
}


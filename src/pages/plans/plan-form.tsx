import { Controller, useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { InputField } from "@/components/ui/input-field"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreatePlanMutation } from "@/api/hooks/usePlans"
import type { PlanFormProps } from "@/types"
import {
  DEFAULT_PLAN_VALUES,
  planSchema,
  type PlanFormValues as FormValues,
} from "@/schemas/plan-schema"

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
          description: data.description,
          plan_type: data.plan_type,
          plan_interval: data.plan_interval,
          price_per_invoice_amount: Number(data.price_per_invoice_amount),
          price_per_invoice_currency: data.price_per_invoice_currency,
          is_active: data.is_active,
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
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Description <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="e.g. Starter tier for basic users"
          {...register("description")}
          className="min-h-[88px] text-sm"
        />
        {errors.description && <span className="block px-1 text-[11px] font-medium text-destructive">{errors.description.message}</span>}
      </div>

      <div className="dialog-field-grid">
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

      <div className="dialog-field-grid">
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

      <div className="dialog-toggle-row">
        <div>
          <Label htmlFor="is_active" className="font-medium text-foreground">Active</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">Plan is immediately available after saving</p>
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

      {showFooter && (
        <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createPlan.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" className="font-medium" disabled={createPlan.isPending}>
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

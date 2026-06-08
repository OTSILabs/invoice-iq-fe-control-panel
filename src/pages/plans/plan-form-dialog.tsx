import { useForm, Controller } from "react-hook-form"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { InputField } from "@/components/ui/input-field"
import { Field, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useCreatePlanMutation } from "@/api/hooks/usePlans"
import type { Plan } from "@/types"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// Zod Validation Schema
const planSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  plan_type: z.string().min(1, "Plan type is required"),
  plan_interval: z.string().min(1, "Plan interval is required"),
  price_per_invoice_amount: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Price must be a valid non-negative number",
    }),
  price_per_invoice_currency: z.string().min(1, "Currency is required"),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof planSchema>

interface PlanFormProps {
  onSuccess?: (data?: Plan) => void
  onCancel?: () => void
  mode?: "create" | "edit"
  plan?: Plan | null
  showFooter?: boolean
  formId?: string
}

// REUSABLE FORM COMPONENT with Zod validation
export function PlanForm({
  onSuccess,
  onCancel,
  mode = "create",
  plan = null,
  showFooter = true,
  formId = "plan-form-inner",
}: PlanFormProps) {
  const createPlanMutation = useCreatePlanMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      description: plan?.description || "",
      plan_type: plan?.plan_type || "Basic",
      plan_interval: plan?.plan_interval || "Monthly",
      price_per_invoice_amount: plan?.price_per_invoice_amount ? String(plan.price_per_invoice_amount) : "0",
      price_per_invoice_currency: plan?.price_per_invoice_currency || "USD",
      is_active: plan?.is_active ?? true,
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      if (mode === "create") {
        const payload: Omit<Plan, "id" | "created_at"> = {
          description: data.description,
          plan_type: data.plan_type,
          plan_interval: data.plan_interval,
          price_per_invoice_amount: Number(data.price_per_invoice_amount),
          price_per_invoice_currency: data.price_per_invoice_currency,
          is_active: data.is_active,
        }

        const createdPlan = await createPlanMutation.mutateAsync(payload)
        toast.success("Plan created successfully!")
        reset()
        onSuccess?.(createdPlan)
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
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Description */}
      <div className="space-y-1">
        <InputField
          id="description"
          label={<>Description <span className="text-destructive">*</span></>}
          type="text"
          placeholder="e.g. Starter tier for basic users"
          {...register("description")}
        />
        {errors.description && (
          <span className="text-[11px] font-medium text-destructive px-1">
            {errors.description.message}
          </span>
        )}
      </div>

      {/* Plan Type */}
      <div className="space-y-1">
        <InputField
          id="plan_type"
          label={<>Plan Type <span className="text-destructive">*</span></>}
          type="select"
          {...register("plan_type")}
        >
          <option value="Basic">Basic</option>
          <option value="Free Trial">Free Trial</option>
        </InputField>
        {errors.plan_type && (
          <span className="text-[11px] font-medium text-destructive px-1">
            {errors.plan_type.message}
          </span>
        )}
      </div>

      {/* Plan Interval */}
      <div className="space-y-1">
        <InputField
          id="plan_interval"
          label={<>Plan Interval <span className="text-destructive">*</span></>}
          type="select"
          {...register("plan_interval")}
        >
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </InputField>
        {errors.plan_interval && (
          <span className="text-[11px] font-medium text-destructive px-1">
            {errors.plan_interval.message}
          </span>
        )}
      </div>

      {/* Price Per Invoice Amount */}
      <div className="space-y-1">
        <InputField
          id="price_per_invoice_amount"
          label={<>Price Per Invoice Amount <span className="text-destructive">*</span></>}
          type="number"
          step="0.01"
          min="0"
          {...register("price_per_invoice_amount")}
        />
        {errors.price_per_invoice_amount && (
          <span className="text-[11px] font-medium text-destructive px-1">
            {errors.price_per_invoice_amount.message}
          </span>
        )}
      </div>

      {/* Price Per Invoice Currency */}
      <div className="space-y-1">
        <InputField
          id="price_per_invoice_currency"
          label={<>Price Per Invoice Currency <span className="text-destructive">*</span></>}
          type="select"
          {...register("price_per_invoice_currency")}
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </InputField>
        {errors.price_per_invoice_currency && (
          <span className="text-[11px] font-medium text-destructive px-1">
            {errors.price_per_invoice_currency.message}
          </span>
        )}
      </div>

      {/* Is Active Toggle */}
      <div className="mt-2 flex items-center justify-between border-t border-border py-2">
        <Label
          htmlFor="is_active"
          className="font-medium text-foreground"
        >
          Is Active
        </Label>
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

      {/* Footer Actions */}
      {showFooter && (
        <div className="flex gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-1/2 rounded-md"
            onClick={onCancel}
            disabled={createPlanMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-1/2 rounded-md font-medium"
            disabled={createPlanMutation.isPending}
          >
            {createPlanMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

interface PlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  plan?: Plan | null
}

// REUSABLE DIALOG WRAPPER
export function PlanFormDialog({
  open,
  onOpenChange,
  mode = "create",
  plan = null,
}: PlanFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="h-5 w-5 text-primary" />
            {mode === "create" ? "Create Plan" : "Edit Plan"}
          </DialogTitle>
          <DialogDescription>
            Provide the required specifications to set up the billing plan.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(85vh-7rem)] overflow-y-auto px-6 py-5">
          <PlanForm
            mode={mode}
            plan={plan}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

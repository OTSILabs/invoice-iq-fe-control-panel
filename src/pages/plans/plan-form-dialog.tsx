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
import { Input } from "@/components/ui/input"
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
      <div className="space-y-1.5">
        <Label
          htmlFor="description"
          className="font-semibold text-slate-700 dark:text-slate-300"
        >
          Description
        </Label>
        <Input
          id="description"
          type="text"
          placeholder="e.g. Starter tier for basic users"
          {...register("description")}
          className="rounded-xl border-slate-200 bg-slate-50/50"
        />
        {errors.description && (
          <span className="text-xs font-medium text-red-500">
            {errors.description.message}
          </span>
        )}
      </div>

      {/* Plan Type */}
      <div className="space-y-1.5">
        <Label
          htmlFor="plan_type"
          className="font-semibold text-slate-700 dark:text-slate-300"
        >
          Plan Type
        </Label>
        <select
          id="plan_type"
          {...register("plan_type")}
          className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
        >
          <option value="Basic">Basic</option>
          <option value="Free Trial">Free Trial</option>
        </select>
        {errors.plan_type && (
          <span className="text-xs font-medium text-red-500">
            {errors.plan_type.message}
          </span>
        )}
      </div>

      {/* Plan Interval */}
      <div className="space-y-1.5">
        <Label
          htmlFor="plan_interval"
          className="font-semibold text-slate-700 dark:text-slate-300"
        >
          Plan Interval
        </Label>
        <select
          id="plan_interval"
          {...register("plan_interval")}
          className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
        >
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
        {errors.plan_interval && (
          <span className="text-xs font-medium text-red-500">
            {errors.plan_interval.message}
          </span>
        )}
      </div>

      {/* Price Per Invoice Amount */}
      <div className="space-y-1.5">
        <Label
          htmlFor="price_per_invoice_amount"
          className="font-semibold text-slate-700 dark:text-slate-300"
        >
          Price Per Invoice Amount
        </Label>
        <Input
          id="price_per_invoice_amount"
          type="number"
          step="0.01"
          min="0"
          {...register("price_per_invoice_amount")}
          className="rounded-xl border-slate-200 bg-slate-50/50"
        />
        {errors.price_per_invoice_amount && (
          <span className="text-xs font-medium text-red-500">
            {errors.price_per_invoice_amount.message}
          </span>
        )}
      </div>

      {/* Price Per Invoice Currency */}
      <div className="space-y-1.5">
        <Label
          htmlFor="price_per_invoice_currency"
          className="font-semibold text-slate-700 dark:text-slate-300"
        >
          Price Per Invoice Currency
        </Label>
        <select
          id="price_per_invoice_currency"
          {...register("price_per_invoice_currency")}
          className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </select>
        {errors.price_per_invoice_currency && (
          <span className="text-xs font-medium text-red-500">
            {errors.price_per_invoice_currency.message}
          </span>
        )}
      </div>

      {/* Is Active Toggle */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 py-2 dark:border-slate-800/80">
        <Label
          htmlFor="is_active"
          className="font-semibold text-slate-700 dark:text-slate-300"
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
        <div className="flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
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
            className="w-1/2 rounded-md font-semibold"
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

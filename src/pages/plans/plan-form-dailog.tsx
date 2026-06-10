import { useForm, Controller } from "react-hook-form"
import { CreditCard, Loader2 } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { InputField } from "@/components/ui/input-field"
import { Label } from "@/components/ui/label"
import { useCreatePlanMutation } from "@/api/hooks/usePlans"
import type { Plan } from "@/types"

// ─── Schema ───────────────────────────────────────────────────────────────────

const planSchema = z.object({
  description:                z.string().min(1, "Description is required").max(255, "Description is too long"),
  plan_type:                  z.string().min(1, "Plan type is required"),
  plan_interval:              z.string().min(1, "Plan interval is required"),
  price_per_invoice_amount:   z.string().min(1, "Price is required").refine(
                                (val) => !isNaN(Number(val)) && Number(val) > 0,
                                { message: "Price must be a valid non-negative number" }
                              ),
  price_per_invoice_currency: z.string().min(1, "Currency is required"),
  is_active:                  z.boolean(),
})

type FormValues = z.infer<typeof planSchema>

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFormProps {
  onSuccess?: (data?: Plan) => void
  onCancel?: () => void
  mode?: "create" | "edit"
  plan?: Plan | null
  showFooter?: boolean
  formId?: string
}

interface PlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  plan?: Plan | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <>{children} <span className="text-destructive">*</span></>
)

const FieldError = ({ message }: { message?: string }) =>
  message ? <span className="px-1 text-[11px] font-medium text-destructive">{message}</span> : null

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
    defaultValues: {
      description:                plan?.description ?? "",
      plan_type:                  plan?.plan_type ?? "Basic",
      plan_interval:              plan?.plan_interval ?? "Monthly",
      price_per_invoice_amount:   plan?.price_per_invoice_amount ? String(plan.price_per_invoice_amount) : "0",
      price_per_invoice_currency: plan?.price_per_invoice_currency ?? "USD",
      is_active:                  plan?.is_active ?? true,
    },
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
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Description — full width */}
      <div className="space-y-1">
        <InputField
          id="description"
          label={<RequiredLabel>Description</RequiredLabel>}
          placeholder="e.g. Starter tier for basic users"
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {/* Plan Type + Plan Interval — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <InputField
            id="plan_type"
            label={<RequiredLabel>Plan Type</RequiredLabel>}
            type="select"
            {...register("plan_type")}
          >
            <option value="Basic">Basic</option>
            <option value="Free Trial">Free Trial</option>
          </InputField>
          <FieldError message={errors.plan_type?.message} />
        </div>

        <div className="space-y-1">
          <InputField
            id="plan_interval"
            label={<RequiredLabel>Plan Interval</RequiredLabel>}
            type="select"
            {...register("plan_interval")}
          >
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </InputField>
          <FieldError message={errors.plan_interval?.message} />
        </div>
      </div>

      {/* Price + Currency — side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <InputField
            id="price_per_invoice_amount"
            label={<RequiredLabel>Price Per Invoice</RequiredLabel>}
            type="number"
            step="0.01"
            min="0"
            {...register("price_per_invoice_amount")}
          />
          <FieldError message={errors.price_per_invoice_amount?.message} />
        </div>

        <div className="space-y-1">
          <InputField
            id="price_per_invoice_currency"
            label={<RequiredLabel>Currency</RequiredLabel>}
            type="select"
            {...register("price_per_invoice_currency")}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </InputField>
          <FieldError message={errors.price_per_invoice_currency?.message} />
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

// ─── PlanFormDialog ───────────────────────────────────────────────────────────

export function PlanFormDialog({ open, onOpenChange, mode = "create", plan = null }: PlanFormDialogProps) {
  const onDone = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="size-5 text-primary" />
            {mode === "create" ? "Create Plan" : "Edit Plan"}
          </DialogTitle>
          <DialogDescription>
            Provide the required specifications to set up the billing plan.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(85vh-7rem)] overflow-y-auto px-6 py-5">
          <PlanForm mode={mode} plan={plan} onSuccess={onDone} onCancel={onDone} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
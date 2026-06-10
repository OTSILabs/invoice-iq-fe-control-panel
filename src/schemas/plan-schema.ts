import { z } from "zod"

export const planSchema = z.object({
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

export type PlanFormValues = z.infer<typeof planSchema>

export const DEFAULT_PLAN_VALUES = (plan?: any): PlanFormValues => ({
  description: plan?.description ?? "",
  plan_type: plan?.plan_type ?? "Basic",
  plan_interval: plan?.plan_interval ?? "Monthly",
  price_per_invoice_amount: plan?.price_per_invoice_amount ? String(plan.price_per_invoice_amount) : "0",
  price_per_invoice_currency: plan?.price_per_invoice_currency ?? "USD",
  is_active: plan?.is_active ?? true,
})

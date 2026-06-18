import { z } from "zod"

const isValid = (v: unknown): boolean => {
  if (v === null || v === undefined) return false
  if (typeof v === "string") return !!v.trim()
  if (Array.isArray(v)) return v.length > 0 && v.every(isValid)
  if (typeof v === "object") {
    const ent = Object.entries(v as Record<string, unknown>)
    return ent.length > 0 && ent.every(([k, nv]) => !!k.trim() && isValid(nv))
  }
  return true
}

export const erpSettingSchema = z.object({
  erp_type: z.string().trim().min(1, "ERP type is required."),
  settingsInput: z.string().min(2, "Settings JSON is required.").superRefine((val, ctx) => {
    try {
      const parsed = JSON.parse(val)
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return ctx.addIssue({ code: "custom", message: "Settings must be a JSON object." })
      }
      if (!isValid(parsed)) {
        ctx.addIssue({
          code: "custom",
          message: "Settings must include at least one valid key-value pair.",
        })
      }
    } catch {
      ctx.addIssue({ code: "custom", message: "Settings must be valid JSON." })
    }
  }),
})

export type ErpSettingFormValues = z.infer<typeof erpSettingSchema>

export const DEFAULT_ERP_SETTING_VALUES: ErpSettingFormValues = {
  erp_type: "",
  settingsInput: "{\n  \n}",
}

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateErpSettingMutation } from "@/api/hooks/useErp"

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

const erpSettingSchema = z.object({
  erp_type: z.string().trim().min(1, "ERP type is required."),
  settingsInput: z.string().min(2, "Settings JSON is required.").superRefine((val, ctx) => {
    try {
      const parsed = JSON.parse(val)
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return ctx.addIssue({ code: "custom", message: "Settings must be a JSON object." })
      }
      if (!isValid(parsed)) {
        ctx.addIssue({ code: "custom", message: "Settings must include at least one valid key-value pair." })
      }
    } catch {
      ctx.addIssue({ code: "custom", message: "Settings must be valid JSON." })
    }
  }),
})

type ErpSettingFormValues = z.infer<typeof erpSettingSchema>

interface ErpSettingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ErpSettingFormDialog({ open, onOpenChange }: ErpSettingFormDialogProps) {
  const { mutate: createErpSetting, isPending } = useCreateErpSettingMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ErpSettingFormValues>({
    resolver: zodResolver(erpSettingSchema),
    defaultValues: { erp_type: "", settingsInput: "{\n  \n}" },
  })

  useEffect(() => {
    if (open) reset({ erp_type: "", settingsInput: "{\n  \n}" })
  }, [open, reset])

  const onSubmit = (vals: ErpSettingFormValues) => {
    createErpSetting(
      { erp_type: vals.erp_type, settings: JSON.parse(vals.settingsInput) },
      {
        onSuccess: () => {
          toast.success("ERP setting created successfully!")
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          toast.error(msg || "Failed to create ERP setting")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add ERP Setting</DialogTitle>
          <DialogDescription>
            Create a new ERP integration configuration for invoice processing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="erp_type" className="text-foreground/90 font-medium">
              ERP Type <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="erp_type"
              placeholder="e.g. sap, cw, oracle"
              {...register("erp_type")}
              className="bg-background h-10"
            />
            {errors.erp_type && (
              <span className="text-xs font-medium text-red-500 block mt-1">{errors.erp_type.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settingsInput" className="text-foreground/90 font-medium">
              Settings (JSON) <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Textarea
              id="settingsInput"
              rows={8}
              placeholder='{"url":"https://example.com","username":"..."}'
              {...register("settingsInput")}
              className="font-mono text-xs bg-background border border-input rounded-md h-48 resize-none"
            />
            {errors.settingsInput ? (
              <span className="text-xs font-medium text-red-500 block mt-1">{errors.settingsInput.message}</span>
            ) : (
              <span className="text-[10px] text-muted-foreground block">
                Provide integration parameters as a valid JSON object.
              </span>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Setting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

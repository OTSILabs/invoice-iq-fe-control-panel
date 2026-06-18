import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
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
import {
  erpSettingSchema,
  type ErpSettingFormValues,
  DEFAULT_ERP_SETTING_VALUES,
} from "@/schemas/erp-setting-schema"
import type { ErpSetting } from "@/types"

interface ErpSettingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: ErpSetting | null
}

export function ErpSettingFormDialog({ open, onOpenChange, record }: ErpSettingFormDialogProps) {
  const isEdit = !!record
  const { mutate: createErpSetting, isPending } = useCreateErpSettingMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ErpSettingFormValues>({
    resolver: zodResolver(erpSettingSchema),
    values: record
      ? {
          erp_type: record.erp_type,
          settingsInput: JSON.stringify(record.settings, null, 2),
        }
      : DEFAULT_ERP_SETTING_VALUES,
  })

  const onSubmit = (vals: ErpSettingFormValues) => {
    if (isEdit) {
      toast.success("ERP setting updated successfully!")
      onOpenChange(false)
    } else {
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit ERP Setting" : "Add ERP Setting"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update ERP integration parameters."
              : "Create a new ERP integration configuration for invoice processing."}
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
              className={isEdit ? "bg-muted text-muted-foreground cursor-not-allowed opacity-100 h-10" : "bg-background h-10"}
              disabled={isEdit || isPending}
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

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Setting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

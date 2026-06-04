import { useEffect } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useCreateErpSettingMutation } from "@/api/hooks/useErp"

const hasValidSettingsValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.every(hasValidSettingsValue);

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      entries.length > 0 &&
      entries.every(([key, nestedValue]) => key.trim().length > 0 && hasValidSettingsValue(nestedValue))
    );
  }

  return true;
};

const erpSettingSchema = z.object({
  erp_type: z.enum(["cw", "sap"], {
    message: "Please select an ERP type.",
  }),
  display_name: z.string().trim().min(2, "Display name must be at least 2 characters."),
  is_enabled: z.boolean(),
  settingsInput: z
    .string()
    .min(2, "Settings JSON is required.")
    .superRefine((value, ctx) => {
      try {
        const parsed = JSON.parse(value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          ctx.addIssue({
            code: "custom",
            message: "Settings must be a JSON object.",
          });
          return;
        }

        if (!hasValidSettingsValue(parsed)) {
          ctx.addIssue({
            code: "custom",
            message: "Settings must include at least one valid key-value pair.",
          });
        }
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "Settings must be valid JSON.",
        });
      }
    }),
});

type ErpSettingFormValues = z.infer<typeof erpSettingSchema>

interface ErpSettingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usedErpTypes: string[]
}

export function ErpSettingFormDialog({
  open,
  onOpenChange,
  usedErpTypes = [],
}: ErpSettingFormDialogProps) {
  const { mutate: createErpSetting, isPending } = useCreateErpSettingMutation()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ErpSettingFormValues>({
    resolver: zodResolver(erpSettingSchema),
    defaultValues: {
      erp_type: "cw",
      display_name: "",
      is_enabled: true,
      settingsInput: "{\n  \n}",
    },
  })

  const watchErpType = useWatch({ control, name: "erp_type" })

  // Clean form state when closing/opening modal
  useEffect(() => {
    if (open) {
      const allTypes = ["cw", "sap"]
      const availableTypes = allTypes.filter((type) => !usedErpTypes.includes(type))
      const defaultType = (availableTypes.length > 0 ? availableTypes[0] : "cw") as "cw" | "sap"
      
      reset({
        erp_type: defaultType,
        display_name: "",
        is_enabled: true,
        settingsInput: "{\n  \n}",
      })
    }
  }, [open, reset, usedErpTypes])

  // Automatically update display name placeholder/default when type changes
  useEffect(() => {
    if (watchErpType) {
      setValue("display_name", `${watchErpType.toUpperCase()} Integration`)
    }
  }, [watchErpType, setValue])

  const onSubmit = (values: ErpSettingFormValues) => {
    const parsedSettings = JSON.parse(values.settingsInput);

    const payload = {
      erp_type: values.erp_type,
      settings: parsedSettings,
    }

    createErpSetting(payload, {
      onSuccess: () => {
        toast.success("ERP setting created successfully!")
        onOpenChange(false)
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { detail?: string } } }
        const detail = error?.response?.data?.detail || "Failed to create ERP setting"
        toast.error(detail)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add ERP Setting</DialogTitle>
          <DialogDescription>
            Create a new ERP integration configuration for invoice processing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            {/* ERP Type */}
            <div className="space-y-1.5 flex-1">
              <Label className="text-foreground font-semibold">ERP Type</Label>
              <Select
                value={watchErpType}
                onValueChange={(val) => setValue("erp_type", val as "cw" | "sap", { shouldValidate: true })}
              >
                <SelectTrigger className="w-full bg-background h-10">
                  <SelectValue placeholder="Select ERP type" />
                </SelectTrigger>
                <SelectContent>
                  {!usedErpTypes.includes("cw") && (
                    <SelectItem value="cw" className="cursor-pointer">CW</SelectItem>
                  )}
                  {!usedErpTypes.includes("sap") && (
                    <SelectItem value="sap" className="cursor-pointer">SAP</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.erp_type && (
                <span className="text-xs font-medium text-red-500 block mt-1">
                  {errors.erp_type.message}
                </span>
              )}
            </div>

            {/* Is Enabled */}
            <div className="flex items-center justify-between rounded-md border p-2.5 h-10 bg-background md:min-w-40">
              <Label htmlFor="is_enabled" className="font-semibold text-slate-700 dark:text-slate-300">
                Enabled
              </Label>
              <Controller
                name="is_enabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_enabled"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary"
                  />
                )}
              />
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <Label htmlFor="display_name" className="text-foreground font-semibold">
              Display Name
            </Label>
            <Input
              id="display_name"
              type="text"
              placeholder="e.g. SAP Production Tenant"
              {...register("display_name")}
              className="bg-background"
            />
            {errors.display_name && (
              <span className="text-xs font-medium text-red-500">
                {errors.display_name.message}
              </span>
            )}
          </div>

          {/* Settings JSON */}
          <div className="space-y-1.5">
            <Label htmlFor="settingsInput" className="text-foreground font-semibold">
              Settings (JSON)
            </Label>
            <Textarea
              id="settingsInput"
              rows={8}
              placeholder='{"url":"https://example.com","username":"..."}'
              {...register("settingsInput")}
              className="font-mono text-xs bg-background border border-input rounded-md h-48 resize-none"
            />
            {errors.settingsInput ? (
              <span className="text-xs font-medium text-red-500">
                {errors.settingsInput.message}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground block">
                Provide integration parameters as a valid JSON object.
              </span>
            )}
          </div>

          {/* Footer Actions */}
          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
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

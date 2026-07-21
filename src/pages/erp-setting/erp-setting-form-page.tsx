import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, PlugZap } from "lucide-react"
import { toast } from "sonner"

import { useCreateErpSettingMutation, useUpdateErpSettingMutation, useErpSettings } from "@/api/hooks/useErp"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_ERP_SETTING_VALUES,
  erpSettingSchema,
  type ErpSettingFormValues,
} from "@/schemas/erp-setting-schema"

export function ErpSettingFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id = "" } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = mode === "edit"
  const { data = [], isLoading, isError } = useErpSettings()
  const record = useMemo(() => data.find((item) => String(item.erp_id) === id), [data, id])
  const { mutate: createErpSetting, isPending: isCreating } = useCreateErpSettingMutation()
  const { mutate: updateErpSetting, isPending: isUpdating } = useUpdateErpSettingMutation()
  const isPending = isCreating || isUpdating

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ErpSettingFormValues>({
    resolver: zodResolver(erpSettingSchema),
    values: record
      ? {
          erp_type: record.erp_type,
          is_enabled: Boolean(record.is_enabled ?? true),
          settingsInput: JSON.stringify(record.settings, null, 2),
        }
      : DEFAULT_ERP_SETTING_VALUES,
  })

  const backToList = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate("/erp-settings")
    }
  }

  const onSubmit = (vals: ErpSettingFormValues) => {
    if (isEdit) {
      if (!record) return
      updateErpSetting(
        {
          erpId: record.erp_id,
          payload: {
            erp_type: vals.erp_type,
            is_enabled: vals.is_enabled,
            settings: JSON.parse(vals.settingsInput),
          },
        },
        {
          onSuccess: () => {
            toast.success("ERP setting updated successfully!")
            backToList()
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            toast.error(msg || "Failed to update ERP setting")
          },
        }
      )
      return
    }

    createErpSetting(
      {
        erp_type: vals.erp_type,
        is_enabled: vals.is_enabled,
        settings: JSON.parse(vals.settingsInput),
      },
      {
        onSuccess: () => {
          toast.success("ERP setting created successfully!")
          backToList()
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          toast.error(msg || "Failed to create ERP setting")
        },
      }
    )
  }

  if (isEdit && isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isEdit && (isError || !record)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load ERP setting.</p>
        <Button variant="outline" size="sm" onClick={backToList}>
          Back to ERP Settings
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={isEdit ? "Edit ERP Setting" : "Add ERP Setting"}
        description={isEdit ? "Update ERP integration parameters." : "Create a new ERP integration configuration for invoice processing."}
      >
        <Button variant="outline" size="sm" onClick={backToList}>
          <ArrowLeft className="size-4" /> Back to ERP Settings
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <PlugZap className="size-4 text-primary" />
            Integration configuration
          </span>
        }
        // className="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="erp_type" className="font-medium text-foreground">
              ERP Type <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="erp_type"
              placeholder="e.g. sap, cw, oracle"
              {...register("erp_type")}
              className={isEdit ? "h-10 cursor-not-allowed bg-muted text-muted-foreground opacity-100" : "h-10 bg-background"}
              disabled={isEdit || isPending}
            />
            {errors.erp_type && <span className="block text-xs font-medium text-destructive">{errors.erp_type.message}</span>}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3.5">
            <div className="space-y-0.5">
              <Label htmlFor="is_enabled" className="text-sm font-medium text-foreground cursor-pointer">
                Enable Integration
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable or disable this ERP configuration setting.
              </p>
            </div>
            <Controller
              name="is_enabled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="cursor-pointer"
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settingsInput" className="font-medium text-foreground">
              Settings (JSON) <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Textarea
              id="settingsInput"
              rows={10}
              placeholder='{"url":"https://example.com","username":"..."}'
              {...register("settingsInput")}
              className="min-h-64 resize-y font-mono text-xs"
              disabled={isPending}
            />
            {errors.settingsInput ? (
              <span className="block text-xs font-medium text-destructive">{errors.settingsInput.message}</span>
            ) : (
              <span className="block text-xs text-muted-foreground">Provide integration parameters as a valid JSON object.</span>
            )}
          </div>

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={backToList} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Setting"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

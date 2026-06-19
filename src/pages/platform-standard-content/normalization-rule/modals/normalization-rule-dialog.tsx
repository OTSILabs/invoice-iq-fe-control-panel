import { useForm, Controller } from "react-hook-form"
import type { UseFormRegister, FieldErrors, Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  useCreateNormalizationRuleMutation,
  useUpdateNormalizationRuleMutation,
} from "@/api/hooks/normalization-rules"
import {
  normalizationRuleSchema,
  type NormalizationRuleFormValues,
  DEFAULT_NORMALIZATION_RULE_VALUES,
} from "@/schemas/normalization-rule-schema"
import type { NormalizationRule } from "@/types"

interface NormalizationRuleDialogProps {
  normalizationRule?: NormalizationRule | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NormalizationRuleDialog({
  normalizationRule,
  open,
  onOpenChange,
}: NormalizationRuleDialogProps) {
  const isEdit = !!normalizationRule
  const { mutate: createRule, isPending: isCreating } = useCreateNormalizationRuleMutation()
  const { mutate: updateRule, isPending: isUpdating } = useUpdateNormalizationRuleMutation()

  const isPending = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<NormalizationRuleFormValues>({
    resolver: zodResolver(normalizationRuleSchema),
    values: normalizationRule
      ? {
          rule_code: normalizationRule.rule_code,
          display_label: normalizationRule.display_label,
          description: normalizationRule.description,
          rule_mode: normalizationRule.rule_mode || "DECLARATIVE",
          engine_type: normalizationRule.engine_type || "",
          implementation_key: normalizationRule.implementation_key || "",
          parameter_schema_json: JSON.stringify(normalizationRule.parameter_schema_json, null, 2),
          engine_config_json: JSON.stringify(normalizationRule.engine_config_json, null, 2),
          supported_data_types: (normalizationRule.supported_data_types_json || []).join(", "),
          supported_header_items: (normalizationRule.supported_header_items_json || []).join(", "),
          is_active: normalizationRule.is_active ?? true,
          sort_sequence: normalizationRule.sort_sequence ?? 1,
        }
      : DEFAULT_NORMALIZATION_RULE_VALUES,
  })

  const formatJSONField = (fieldName: "parameter_schema_json" | "engine_config_json") => {
    const val = getValues(fieldName)
    if (!val) return
    try {
      const parsed = JSON.parse(val)
      setValue(fieldName, JSON.stringify(parsed, null, 2))
    } catch {
      // Ignore invalid JSON on blur
    }
  }

  const onSubmit = (data: NormalizationRuleFormValues) => {
    const parseJSON = (str: string) => {
      try {
        return JSON.parse(str)
      } catch {
        return {}
      }
    }

    const payload = {
      rule_code: data.rule_code,
      display_label: data.display_label,
      description: data.description,
      rule_mode: data.rule_mode,
      engine_type: data.engine_type || null,
      implementation_key: data.implementation_key || null,
      parameter_schema_json: parseJSON(data.parameter_schema_json),
      engine_config_json: parseJSON(data.engine_config_json),
      supported_data_types_json: data.supported_data_types
        ? data.supported_data_types.split(",").flatMap((s) => {
            const trimmed = s.trim()
            return trimmed ? [trimmed] : []
          })
        : [],
      supported_header_items_json: data.supported_header_items
        ? data.supported_header_items.split(",").flatMap((s) => {
            const trimmed = s.trim()
            return trimmed ? [trimmed] : []
          })
        : [],
      is_active: data.is_active,
      sort_sequence: data.sort_sequence,
    }

    if (isEdit && normalizationRule) {
      updateRule(
        {
          rule_code: normalizationRule.rule_code,
          payload,
        },
        {
          onSuccess: () => {
            toast.success(`Normalization rule "${data.display_label}" updated successfully!`)
            onOpenChange(false)
          },
          onError: (err: unknown) => {
            let errMsg = "Failed to update normalization rule."
            const axiosErr = err as { response?: { data?: { detail?: unknown; message?: unknown } } }
            if (axiosErr.response?.data?.detail) {
              errMsg = String(axiosErr.response.data.detail)
            } else if (axiosErr.response?.data?.message) {
              errMsg = String(axiosErr.response.data.message)
            } else if (err instanceof Error) {
              errMsg = err.message
            }
            toast.error(errMsg)
          },
        }
      )
    } else {
      createRule(payload, {
        onSuccess: () => {
          toast.success(`Normalization rule "${data.display_label}" created successfully!`)
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          let errMsg = "Failed to create normalization rule."
          const axiosErr = err as { response?: { data?: { detail?: unknown; message?: unknown } } }
          if (axiosErr.response?.data?.detail) {
            errMsg = String(axiosErr.response.data.detail)
          } else if (axiosErr.response?.data?.message) {
            errMsg = String(axiosErr.response.data.message)
          } else if (err instanceof Error) {
            errMsg = err.message
          }
          toast.error(errMsg)
        },
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isPending) {
          onOpenChange(val)
        }
      }}
    >
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-[800px] w-11/12">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="size-5 text-primary" />
            {isEdit ? "Edit Normalization Rule" : "Create Normalization Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the configuration, engine settings, and supported targets for this normalization rule."
              : "Add a new declarative normalization rule to clean up or transform document fields."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(85vh-5.5rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <NormalizationRuleFormFields
              register={register}
              errors={errors}
              control={control}
              isEdit={isEdit}
              isPending={isPending}
              formatJSONField={formatJSONField}
            />
          </ScrollArea>

          {/* Dialog Footer Actions */}
          <DialogFooter className="gap-3 border-t border-border bg-popover px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer text-xs"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer text-xs gap-1.5"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface NormalizationRuleFormFieldsProps {
  register: UseFormRegister<NormalizationRuleFormValues>
  errors: FieldErrors<NormalizationRuleFormValues>
  control: Control<NormalizationRuleFormValues>
  isEdit: boolean
  isPending: boolean
  formatJSONField: (fieldName: "parameter_schema_json" | "engine_config_json") => void
}

function NormalizationRuleFormFields({
  register,
  errors,
  control,
  isEdit,
  isPending,
  formatJSONField,
}: NormalizationRuleFormFieldsProps) {
  return (
    <div className="px-6 py-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label={isEdit ? "Rule Code (Read-only)" : "Rule Code"}
          placeholder="e.g. clean_spaces"
          disabled={isEdit || isPending}
          error={errors.rule_code?.message}
          {...register("rule_code")}
          required
          className={isEdit ? "bg-muted text-muted-foreground opacity-100 cursor-not-allowed" : ""}
        />

        <InputField
          label="Display Label"
          placeholder="e.g. Clean Whitespaces"
          error={errors.display_label?.message}
          disabled={isPending}
          {...register("display_label")}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Description <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="e.g. Standardizes white spaces and trims leading/trailing spaces"
          disabled={isPending}
          {...register("description")}
          className="min-h-[80px] text-xs bg-inherit border border-input rounded-lg"
        />
        {errors.description && (
          <span className="px-1 text-[11px] font-medium text-destructive block">
            {errors.description.message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Rule Mode"
          type="select"
          error={errors.rule_mode?.message}
          disabled={isPending}
          {...register("rule_mode")}
          required
        >
          <option value="DECLARATIVE">DECLARATIVE</option>
          <option value="CODE">CODE</option>
        </InputField>

        <InputField
          label="Sort Sequence"
          type="number"
          placeholder="e.g. 1"
          error={errors.sort_sequence?.message}
          disabled={isPending}
          {...register("sort_sequence", { valueAsNumber: true })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Engine Type"
          placeholder="e.g. regex_cleaner"
          error={errors.engine_type?.message}
          disabled={isPending}
          {...register("engine_type")}
        />

        <InputField
          label="Implementation Key"
          placeholder="e.g. regex"
          error={errors.implementation_key?.message}
          disabled={isPending}
          {...register("implementation_key")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Supported Data Types"
          placeholder="e.g. string, number (comma-separated)"
          error={errors.supported_data_types?.message}
          disabled={isPending}
          {...register("supported_data_types")}
        />

        <InputField
          label="Supported Header Items"
          placeholder="e.g. billing_address, phone (comma-separated)"
          error={errors.supported_header_items?.message}
          disabled={isPending}
          {...register("supported_header_items")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="parameter_schema_json" className="text-sm font-medium text-foreground">
            Parameter Schema (JSON)
          </Label>
          <Textarea
            id="parameter_schema_json"
            placeholder='e.g. { "trim": true }'
            disabled={isPending}
            {...register("parameter_schema_json")}
            onBlur={(e) => {
              register("parameter_schema_json").onBlur(e)
              formatJSONField("parameter_schema_json")
            }}
            className="font-mono text-xs min-h-[120px] bg-inherit border border-input rounded-lg"
          />
          {errors.parameter_schema_json && (
            <span className="px-1 text-[11px] font-medium text-destructive block">
              {errors.parameter_schema_json.message}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="engine_config_json" className="text-sm font-medium text-foreground">
            Engine Config (JSON)
          </Label>
          <Textarea
            id="engine_config_json"
            placeholder='e.g. { "case_insensitive": true }'
            disabled={isPending}
            {...register("engine_config_json")}
            onBlur={(e) => {
              register("engine_config_json").onBlur(e)
              formatJSONField("engine_config_json")
            }}
            className="font-mono text-xs min-h-[120px] bg-inherit border border-input rounded-lg"
          />
          {errors.engine_config_json && (
            <span className="px-1 text-[11px] font-medium text-destructive block">
              {errors.engine_config_json.message}
            </span>
          )}
        </div>
      </div>

      {/* Is Active Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div>
          <Label htmlFor="is_active" className="text-xs font-semibold text-foreground">Is Active</Label>
          <p className="text-[10px] text-muted-foreground mt-0.5">Toggle normalization rule active status</p>
        </div>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Switch
              id="is_active"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isPending}
              className="data-[state=checked]:bg-primary"
            />
          )}
        />
      </div>
    </div>
  )
}

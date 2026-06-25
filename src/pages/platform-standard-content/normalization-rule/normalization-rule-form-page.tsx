import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import {
  useCreateNormalizationRuleMutation,
  useNormalizationRule,
  useUpdateNormalizationRuleMutation,
} from "@/api/hooks/normalization-rules"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_NORMALIZATION_RULE_VALUES,
  normalizationRuleSchema,
  type NormalizationRuleFormValues,
} from "@/schemas/normalization-rule-schema"

export function NormalizationRuleFormPage({ mode }: { mode: "create" | "edit" }) {
  const { code = "" } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const isEdit = mode === "edit"
  const { data: normalizationRule, isLoading, isError } = useNormalizationRule(code, isEdit)
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

  const backToList = () => navigate("/platform-standard-content/normalization-rules")

  const formatJSONField = (fieldName: "parameter_schema_json" | "engine_config_json") => {
    const val = getValues(fieldName)
    if (!val) return
    try {
      const parsed = JSON.parse(val)
      setValue(fieldName, JSON.stringify(parsed, null, 2))
    } catch {
      // Keep invalid JSON visible so validation can report it on submit.
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

    const onError = (err: unknown, fallback: string) => {
      const axiosErr = err as { response?: { data?: { detail?: unknown; message?: unknown } } }
      toast.error(String(axiosErr.response?.data?.detail || axiosErr.response?.data?.message || (err instanceof Error ? err.message : fallback)))
    }

    if (isEdit && normalizationRule) {
      updateRule(
        { rule_code: normalizationRule.rule_code, payload },
        {
          onSuccess: () => {
            toast.success(`Normalization rule "${data.display_label}" updated successfully!`)
            navigate(`/platform-standard-content/normalization-rules/${normalizationRule.rule_code}`)
          },
          onError: (err) => onError(err, "Failed to update normalization rule."),
        }
      )
      return
    }

    createRule(payload, {
      onSuccess: () => {
        toast.success(`Normalization rule "${data.display_label}" created successfully!`)
        navigate(`/platform-standard-content/normalization-rules/${data.rule_code}`)
      },
      onError: (err) => onError(err, "Failed to create normalization rule."),
    })
  }

  if (isEdit && isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isEdit && (isError || !normalizationRule)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load normalization rule.</p>
        <Button variant="outline" size="sm" onClick={backToList}>
          Back to Normalization Rules
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={isEdit ? "Edit Normalization Rule" : "Create Normalization Rule"}
        description={isEdit ? "Update configuration, engine settings, and supported targets." : "Add a declarative normalization rule to clean or transform extracted fields."}
      >
        <Button variant="outline" size="sm" onClick={backToList}>
          <ArrowLeft className="size-4" /> Back to Normalization Rules
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Rule configuration
          </span>
        }
    
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="dialog-field-grid">
            <InputField
              label={isEdit ? "Rule Code (Read-only)" : "Rule Code"}
              placeholder="e.g. clean_spaces"
              disabled={isEdit || isPending}
              error={errors.rule_code?.message}
              {...register("rule_code")}
              required
              className={isEdit ? "cursor-not-allowed bg-muted text-muted-foreground opacity-100" : ""}
            />

            <InputField label="Display Label" placeholder="e.g. Clean Whitespaces" error={errors.display_label?.message} disabled={isPending} {...register("display_label")} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="e.g. Standardizes white spaces and trims leading/trailing spaces"
              disabled={isPending}
              {...register("description")}
              className="min-h-[88px] text-sm"
            />
            {errors.description && <span className="block px-1 text-[11px] font-medium text-destructive">{errors.description.message}</span>}
          </div>

          <div className="dialog-field-grid">
            <InputField label="Rule Mode" type="select" error={errors.rule_mode?.message} disabled={isPending} {...register("rule_mode")} required>
              <option value="DECLARATIVE">DECLARATIVE</option>
              <option value="CODE">CODE</option>
            </InputField>

            <InputField label="Sort Sequence" type="number" placeholder="e.g. 1" error={errors.sort_sequence?.message} disabled={isPending} {...register("sort_sequence", { valueAsNumber: true })} required />
          </div>

          <div className="dialog-field-grid">
            <InputField label="Engine Type" placeholder="e.g. regex_cleaner" error={errors.engine_type?.message} disabled={isPending} {...register("engine_type")} />
            <InputField label="Implementation Key" placeholder="e.g. regex" error={errors.implementation_key?.message} disabled={isPending} {...register("implementation_key")} />
          </div>

          <div className="dialog-field-grid">
            <InputField label="Supported Data Types" placeholder="e.g. string, number (comma-separated)" error={errors.supported_data_types?.message} disabled={isPending} {...register("supported_data_types")} />
            <InputField label="Supported Header Items" placeholder="e.g. billing_address, phone (comma-separated)" error={errors.supported_header_items?.message} disabled={isPending} {...register("supported_header_items")} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="parameter_schema_json" className="text-sm font-medium text-foreground">Parameter Schema (JSON)</Label>
              <Textarea
                id="parameter_schema_json"
                placeholder='e.g. { "trim": true }'
                disabled={isPending}
                {...register("parameter_schema_json")}
                onBlur={(e) => {
                  register("parameter_schema_json").onBlur(e)
                  formatJSONField("parameter_schema_json")
                }}
                className="min-h-[132px] font-mono text-xs"
              />
              {errors.parameter_schema_json && <span className="block px-1 text-[11px] font-medium text-destructive">{errors.parameter_schema_json.message}</span>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="engine_config_json" className="text-sm font-medium text-foreground">Engine Config (JSON)</Label>
              <Textarea
                id="engine_config_json"
                placeholder='e.g. { "case_insensitive": true }'
                disabled={isPending}
                {...register("engine_config_json")}
                onBlur={(e) => {
                  register("engine_config_json").onBlur(e)
                  formatJSONField("engine_config_json")
                }}
                className="min-h-[132px] font-mono text-xs"
              />
              {errors.engine_config_json && <span className="block px-1 text-[11px] font-medium text-destructive">{errors.engine_config_json.message}</span>}
            </div>
          </div>

          <div className="dialog-toggle-row">
            <div>
              <Label htmlFor="is_active" className="font-medium text-foreground">Is Active</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Toggle normalization rule active status</p>
            </div>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} disabled={isPending} className="data-[state=checked]:bg-primary" />
              )}
            />
          </div>

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={backToList} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Rule"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

import { PageMetadata } from "@/components/layout/PageMetadata"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import {
  useCreateValidationRuleMutation,
  useUpdateValidationRuleMutation,
  useValidationRule,
} from "@/api/hooks/validation-rules"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_VALIDATION_RULE_VALUES,
  validationRuleSchema,
  type ValidationRuleFormValues,
} from "@/schemas/validation-rule-schema"

export function ValidationRuleFormPage({ mode }: { mode: "create" | "edit" }) {
  const { code = "" } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const isEdit = mode === "edit"
  const { data: validationRule, isLoading, isError } = useValidationRule(code, isEdit)
  const { mutate: createRule, isPending: isCreating } = useCreateValidationRuleMutation()
  const { mutate: updateRule, isPending: isUpdating } = useUpdateValidationRuleMutation()
  const isPending = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ValidationRuleFormValues>({
    resolver: zodResolver(validationRuleSchema),
    values: validationRule
      ? {
          rule_code: validationRule.rule_code,
          display_label: validationRule.display_label,
          description: validationRule.description,
          rule_mode: validationRule.rule_mode || "DECLARATIVE",
          engine_type: validationRule.engine_type || "",
          implementation_key: validationRule.implementation_key || "",
          parameter_schema_json: JSON.stringify(validationRule.parameter_schema_json, null, 2),
          engine_config_json: JSON.stringify(validationRule.engine_config_json, null, 2),
          supported_data_types: (validationRule.supported_data_types_json || []).join(", "),
          supported_header_items: (validationRule.supported_header_items_json || []).join(", "),
          is_active: validationRule.is_active ?? true,
          sort_sequence: validationRule.sort_sequence ?? 1,
        }
      : DEFAULT_VALIDATION_RULE_VALUES,
  })

  const backToList = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate("/platform-standard-content/validation-rules")
    }
  }

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

  const onSubmit = (data: ValidationRuleFormValues) => {
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

    if (isEdit && validationRule) {
      updateRule(
        { rule_code: validationRule.rule_code, payload },
        {
          onSuccess: () => {
            toast.success(`Validation rule "${data.display_label}" updated successfully!`)
            navigate(`/platform-standard-content/validation-rules/${validationRule.rule_code}`)
          },
          onError: (err) => onError(err, "Failed to update validation rule."),
        }
      )
      return
    }

    createRule(payload, {
      onSuccess: () => {
        toast.success(`Validation rule "${data.display_label}" created successfully!`)
        navigate(`/platform-standard-content/validation-rules/${data.rule_code}`)
      },
      onError: (err) => onError(err, "Failed to create validation rule."),
    })
  }

  if (isEdit && isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isEdit && (isError || !validationRule)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load validation rule.</p>
        <Button variant="outline" size="sm" onClick={backToList}>
          Back to Validation Rules
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={isEdit ? "Edit Validation Rule" : "Create Validation Rule"}
        description={isEdit ? "Update configuration, engine settings, and supported targets." : "Add a declarative validation rule for extracted document fields."}
      >
        <Button variant="outline" size="sm" onClick={backToList}>
          <ArrowLeft className="size-4" /> Back to Validation Rules
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
          <RuleFields
            register={register}
            errors={errors}
            control={control}
            isEdit={isEdit}
            isPending={isPending}
            formatJSONField={formatJSONField}
            descriptionPlaceholder="e.g. Ensures that the field conforms to a valid email address format"
            engineTypePlaceholder="e.g. regex_validator"
            supportedDataTypesPlaceholder="e.g. string, email (comma-separated)"
            supportedHeaderItemsPlaceholder="e.g. billing_email, vendor_email (comma-separated)"
            parameterPlaceholder='e.g. { "pattern": "^.+@.+$" }'
            toggleDescription="Toggle validation rule active status"
          />

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={backToList} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Validation Rule"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

function RuleFields({
  register,
  errors,
  control,
  isEdit,
  isPending,
  formatJSONField,
  descriptionPlaceholder,
  engineTypePlaceholder,
  supportedDataTypesPlaceholder,
  supportedHeaderItemsPlaceholder,
  parameterPlaceholder,
  toggleDescription,
}: any) {
  return (
    <>
      <PageMetadata title="Validation Rule Form" description="Configure validation rule registry values." keywords="validation rules, field constraints" />
      <div className="dialog-field-grid">
        <InputField
          label={isEdit ? "Rule Code (Read-only)" : "Rule Code"}
          placeholder="e.g. valid_email"
          disabled={isEdit || isPending}
          error={errors.rule_code?.message}
          {...register("rule_code")}
          required
          className={isEdit ? "cursor-not-allowed bg-muted text-muted-foreground opacity-100" : ""}
        />

        <InputField
          label="Display Label"
          placeholder="e.g. Valid Email Format"
          error={errors.display_label?.message}
          disabled={isPending}
          {...register("display_label")}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Description <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder={descriptionPlaceholder}
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

      <div className="dialog-field-grid">
        <InputField label="Engine Type" placeholder={engineTypePlaceholder} error={errors.engine_type?.message} disabled={isPending} {...register("engine_type")} />
        <InputField label="Implementation Key" placeholder="e.g. regex" error={errors.implementation_key?.message} disabled={isPending} {...register("implementation_key")} />
      </div>

      <div className="dialog-field-grid">
        <InputField label="Supported Data Types" placeholder={supportedDataTypesPlaceholder} error={errors.supported_data_types?.message} disabled={isPending} {...register("supported_data_types")} />
        <InputField label="Supported Header Items" placeholder={supportedHeaderItemsPlaceholder} error={errors.supported_header_items?.message} disabled={isPending} {...register("supported_header_items")} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="parameter_schema_json" className="text-sm font-medium text-foreground">Parameter Schema (JSON)</Label>
          <Textarea
            id="parameter_schema_json"
            placeholder={parameterPlaceholder}
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
          <p className="mt-0.5 text-xs text-muted-foreground">{toggleDescription}</p>
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
    </>
  )
}
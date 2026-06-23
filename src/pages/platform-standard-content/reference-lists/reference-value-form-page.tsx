import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react"
import { toast } from "sonner"

import {
  useCreateReferenceValue,
  useReferenceValueDetail,
  useUpdateReferenceValue,
} from "@/api/hooks/useReferenceLists"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputField } from "@/components/ui/input-field"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_VALUE_VALUES,
  referenceValueSchema,
  type ReferenceValueFormValues,
} from "@/schemas/reference-schema"

export function ReferenceValueFormPage({ mode }: { mode: "create" | "edit" }) {
  const { key = "", valueCode = "" } = useParams<{ key: string; valueCode: string }>()
  const navigate = useNavigate()
  const isEdit = mode === "edit"
  const { data: valueItem, isLoading, isError } = useReferenceValueDetail(key, isEdit ? valueCode : "")
  const createMutation = useCreateReferenceValue()
  const updateMutation = useUpdateReferenceValue()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<ReferenceValueFormValues>({
    resolver: zodResolver(referenceValueSchema) as any,
    values: valueItem
      ? {
          value_code: valueItem.value_code,
          value_label: valueItem.value_label,
          description: valueItem.description || "",
          sort_sequence: valueItem.sort_sequence,
          attributes_raw: valueItem.attributes ? JSON.stringify(valueItem.attributes, null, 2) : "",
        }
      : DEFAULT_VALUE_VALUES,
  })

  const backToRegistry = () => navigate(`/platform-standard-content/reference-lists/${key}`)

  const onSubmit = async (values: ReferenceValueFormValues) => {
    let attributes = null
    if (values.attributes_raw && values.attributes_raw.trim()) {
      try {
        attributes = JSON.parse(values.attributes_raw)
      } catch {
        toast.error("Invalid attributes JSON format")
        return
      }
    }

    const payload = {
      value_code: values.value_code,
      value_label: values.value_label,
      description: values.description,
      sort_sequence: values.sort_sequence,
      attributes,
    }

    try {
      if (isEdit && valueItem) {
        await updateMutation.mutateAsync({
          key,
          valueCode: valueItem.value_code,
          payload,
        })
        toast.success("Reference value updated successfully")
        navigate(`/platform-standard-content/reference-lists/${key}/${valueItem.value_code}`)
        return
      }

      await createMutation.mutateAsync({ key, payload })
      toast.success("Reference value added successfully")
      navigate(`/platform-standard-content/reference-lists/${key}/${values.value_code}`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to save reference value")
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isEdit && (isError || !valueItem)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load reference value.</p>
        <Button variant="outline" size="sm" onClick={backToRegistry}>
          Back to Reference List
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={isEdit ? "Edit Reference Value" : "Create Reference Value"}
        description={isEdit ? "Update label, sort order, and custom attributes for this lookup item." : "Append a new lookup value to this reference list."}
      >
        <Button variant="outline" size="sm" onClick={backToRegistry}>
          <ArrowLeft className="size-4" /> Back to Reference List
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <PlusCircle className="size-4 text-primary" />
            Value configuration
          </span>
        }
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="dialog-field-grid">
            <InputField
              id="value_code"
              label="Value Code / Key"
              required
              disabled={isEdit || isSaving}
              error={errors.value_code?.message}
              placeholder="e.g. active"
              className={isEdit ? "cursor-not-allowed bg-muted text-muted-foreground opacity-100" : ""}
              {...register("value_code")}
            />

            <InputField
              id="value_label"
              label="Display Value / Label"
              required
              disabled={isSaving}
              error={errors.value_label?.message}
              placeholder="e.g. Active"
              {...register("value_label")}
            />
          </div>

          <Field>
            <FieldLabel htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </FieldLabel>
            <Textarea
              id="description"
              disabled={isSaving}
              placeholder="Provide details about what this value represents..."
              className="min-h-[88px] rounded-lg border border-input bg-inherit text-sm"
              {...register("description")}
            />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </Field>

          <InputField
            id="sort_sequence"
            label="Sort Sequence"
            type="number"
            required
            disabled={isSaving}
            error={errors.sort_sequence?.message}
            placeholder="1"
            {...register("sort_sequence", { valueAsNumber: true })}
          />

          <Field>
            <FieldLabel htmlFor="attributes_raw" className="text-sm font-medium text-foreground">
              Custom Attributes (JSON format)
            </FieldLabel>
            <Textarea
              id="attributes_raw"
              disabled={isSaving}
              placeholder='e.g. { "currency_symbol": "$", "numeric_code": 840 }'
              className="min-h-[132px] rounded-lg border border-input bg-inherit font-mono text-xs"
              {...register("attributes_raw")}
            />
            {errors.attributes_raw && <FieldError>{errors.attributes_raw.message}</FieldError>}
          </Field>

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={backToRegistry} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Value"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

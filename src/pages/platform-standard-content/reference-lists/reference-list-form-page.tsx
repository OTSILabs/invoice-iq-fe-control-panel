import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ListChecks, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  useCreateReferenceRegistry,
  useReferenceListDetail,
  useUpdateReferenceRegistry,
} from "@/api/hooks/useReferenceLists"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputField } from "@/components/ui/input-field"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_REGISTRY_VALUES,
  referenceRegistrySchema,
  type ReferenceRegistryFormValues,
} from "@/schemas/reference-schema"

export function ReferenceListFormPage({ mode }: { mode: "create" | "edit" }) {
  const { key = "" } = useParams<{ key: string }>()
  const navigate = useNavigate()
  const isEdit = mode === "edit"
  const { data: registry, isLoading, isError } = useReferenceListDetail(isEdit ? key : "")
  const createMutation = useCreateReferenceRegistry()
  const updateMutation = useUpdateReferenceRegistry()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<ReferenceRegistryFormValues>({
    resolver: zodResolver(referenceRegistrySchema) as any,
    values: registry
      ? {
          registry_key: registry.registry_key,
          display_label: registry.display_label,
          description: registry.description || "",
          source_type: registry.source_type,
          sort_sequence: registry.sort_sequence,
        }
      : DEFAULT_REGISTRY_VALUES,
  })

  const backToList = () => navigate("/platform-standard-content/reference-lists")

  const onSubmit = async (values: ReferenceRegistryFormValues) => {
    try {
      if (isEdit && registry) {
        await updateMutation.mutateAsync({
          key: registry.registry_key,
          payload: {
            display_label: values.display_label,
            description: values.description,
            source_type: values.source_type,
            sort_sequence: values.sort_sequence,
          },
        })
        toast.success("Reference list updated successfully")
        navigate(`/platform-standard-content/reference-lists/${registry.registry_key}`)
        return
      }

      await createMutation.mutateAsync(values)
      toast.success("Reference list created successfully")
      navigate(`/platform-standard-content/reference-lists/${values.registry_key}`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to save reference list")
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isEdit && (isError || !registry)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load reference list.</p>
        <Button variant="outline" size="sm" onClick={backToList}>
          Back to Reference Lists
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={isEdit ? "Edit Reference List" : "Create Reference List"}
        description={isEdit ? "Update settings and sorting for this reference list registry." : "Create a platform lookup or reference list registry."}
      >
        <Button variant="outline" size="sm" onClick={backToList}>
          <ArrowLeft className="size-4" /> Back to Reference Lists
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <ListChecks className="size-4 text-primary" />
            Registry configuration
          </span>
        }
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="dialog-field-grid">
            <InputField
              id="registry_key"
              label="Registry Key"
              required
              disabled={isEdit || isSaving}
              error={errors.registry_key?.message}
              placeholder="e.g. billing_status"
              className={isEdit ? "cursor-not-allowed bg-muted text-muted-foreground opacity-100" : ""}
              {...register("registry_key")}
            />

            <InputField
              id="display_label"
              label="Display Label"
              required
              disabled={isSaving}
              error={errors.display_label?.message}
              placeholder="e.g. Billing Status"
              {...register("display_label")}
            />
          </div>

          <div className="dialog-field-grid">
            <InputField
              id="source_type"
              label="Source Type"
              required
              disabled={isSaving}
              error={errors.source_type?.message}
              placeholder="e.g. custom"
              {...register("source_type")}
            />

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
          </div>

          <Field>
            <FieldLabel htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </FieldLabel>
            <Textarea
              id="description"
              disabled={isSaving}
              placeholder="Describe the purpose of this reference list..."
              className="min-h-[96px] text-sm"
              {...register("description")}
            />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </Field>

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={backToList} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create List"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

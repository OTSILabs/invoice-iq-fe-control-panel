import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, Tags } from "lucide-react"
import { toast } from "sonner"

import { useCreateFieldCategory, useFieldCategory, useUpdateFieldCategory } from "@/api/hooks/useFieldCategories"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputField } from "@/components/ui/input-field"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_FIELD_CATEGORY_VALUES,
  fieldCategorySchema,
  type FieldCategoryFormValues,
} from "@/schemas/field-category-schema"

export function FieldCategoryFormPage({ mode }: { mode: "create" | "edit" }) {
  const { code = "" } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const isEdit = mode === "edit"
  const { data: category, isLoading, isError } = useFieldCategory(isEdit ? code : "")
  const createMutation = useCreateFieldCategory()
  const updateMutation = useUpdateFieldCategory()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<FieldCategoryFormValues>({
    resolver: zodResolver(fieldCategorySchema),
    values: category
      ? {
          field_category_code: category.field_category_code,
          ui_label: category.ui_label,
          description: category.description,
          example_fields_raw: category.example_fields ? category.example_fields.join(", ") : "",
          sort_sequence: category.sort_sequence,
        }
      : DEFAULT_FIELD_CATEGORY_VALUES,
  })

  const backToList = () => navigate("/platform-standard-content/field-categories")

  const onSubmit = async (values: FieldCategoryFormValues) => {
    const example_fields = values.example_fields_raw
      ? values.example_fields_raw.split(",").flatMap((s: string) => {
          const trimmed = s.trim()
          return trimmed ? [trimmed] : []
        })
      : []

    const payload = {
      field_category_code: values.field_category_code,
      ui_label: values.ui_label,
      description: values.description,
      example_fields,
      sort_sequence: values.sort_sequence,
    }

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          code: category.field_category_code,
          payload,
        })
        toast.success("Field category updated successfully")
        navigate(`/platform-standard-content/field-categories/${category.field_category_code}`)
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Field category created successfully")
        navigate(`/platform-standard-content/field-categories/${values.field_category_code}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to save category")
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isEdit && (isError || !category)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load field category.</p>
        <Button variant="outline" size="sm" onClick={backToList}>
          Back to Field Categories
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={isEdit ? "Edit Field Category" : "Create Field Category"}
        description={isEdit ? "Update this platform standard field category." : "Create a standard category to organize extraction fields."}
      >
        <Button variant="outline" size="sm" onClick={backToList}>
          <ArrowLeft className="size-4" /> Back to Field Categories
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <Tags className="size-4 text-primary" />
            Category configuration
          </span>
        }
    
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="dialog-field-grid">
            <InputField
              id="field_category_code"
              label="Field Category Code"
              required
              disabled={isEdit || isSaving}
              error={errors.field_category_code?.message}
              placeholder="e.g. invoice_header"
              className={isEdit ? "cursor-not-allowed bg-muted text-muted-foreground opacity-100" : ""}
              {...register("field_category_code")}
            />

            <InputField
              id="ui_label"
              label="UI Label"
              required
              disabled={isSaving}
              error={errors.ui_label?.message}
              placeholder="e.g. Invoice Header"
              {...register("ui_label")}
            />
          </div>

          <Field>
            <FieldLabel htmlFor="description" className="text-sm font-medium text-foreground">
              Description <span className="ml-0.5 text-destructive">*</span>
            </FieldLabel>
            <Textarea
              id="description"
              disabled={isSaving}
              placeholder="Describe what fields belong in this category..."
              className="min-h-[96px] text-sm"
              {...register("description")}
            />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </Field>

          <div className="dialog-field-grid">
            <InputField
              id="example_fields_raw"
              label="Example Fields (comma-separated)"
              disabled={isSaving}
              placeholder="e.g. invoice_id, invoice_date, vendor_name"
              description="Separate fields with commas."
              {...register("example_fields_raw")}
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

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={backToList} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

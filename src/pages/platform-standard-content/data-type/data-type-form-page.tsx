import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Database, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useCreateDataTypeMutation, useDataType, useUpdateDataTypeMutation } from "@/api/hooks/data-types"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  createDataTypeSchema,
  DEFAULT_CREATE_DATA_TYPE_VALUES,
  type CreateDataTypeFormValues,
} from "@/schemas/data-type-schema"

export function DataTypeFormPage({ mode }: { mode: "create" | "edit" }) {
  const { code = "" } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const isEdit = mode === "edit"
  const { data: dataType, isLoading, isError } = useDataType(code, isEdit)
  const { mutate: createDataType, isPending: isCreating } = useCreateDataTypeMutation()
  const { mutate: updateDataType, isPending: isUpdating } = useUpdateDataTypeMutation()
  const isPending = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDataTypeFormValues>({
    resolver: zodResolver(createDataTypeSchema),
    values: dataType
      ? {
          data_type_code: dataType.data_type_code,
          display_label: dataType.display_label,
          description: dataType.description,
          sample_value: dataType.sample_value || "",
          sort_sequence: dataType.sort_sequence ?? 1,
        }
      : DEFAULT_CREATE_DATA_TYPE_VALUES,
  })

  const backToList = () => navigate("/platform-standard-content/data-types")

  const onSubmit = (data: CreateDataTypeFormValues) => {
    if (isEdit && dataType) {
      updateDataType(
        {
          data_type_code: dataType.data_type_code,
          payload: {
            display_label: data.display_label,
            description: data.description,
            sample_value: data.sample_value,
            sort_sequence: data.sort_sequence,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Data type "${data.display_label}" updated successfully!`)
            navigate(`/platform-standard-content/data-types/${dataType.data_type_code}`)
          },
          onError: (err: unknown) => {
            const axiosErr = err as { response?: { data?: { message?: unknown } } }
            toast.error(String(axiosErr.response?.data?.message || (err instanceof Error ? err.message : "Failed to update data type.")))
          },
        }
      )
      return
    }

    createDataType(data, {
      onSuccess: () => {
        toast.success(`Data type "${data.display_label}" created successfully!`)
        navigate(`/platform-standard-content/data-types/${data.data_type_code}`)
      },
      onError: (err: unknown) => {
        const axiosErr = err as { response?: { data?: { message?: unknown } } }
        toast.error(String(axiosErr.response?.data?.message || (err instanceof Error ? err.message : "Failed to create data type.")))
      },
    })
  }

  if (isEdit && isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isEdit && (isError || !dataType)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load data type.</p>
        <Button variant="outline" size="sm" onClick={backToList}>
          Back to Data Types
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={isEdit ? "Edit Data Type" : "Create Data Type"}
        description={isEdit ? "Update the platform standard data type configuration." : "Add a new platform standard data type for field validation."}
      >
        <Button variant="outline" size="sm" onClick={backToList}>
          <ArrowLeft className="size-4" /> Back to Data Types
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <Database className="size-4 text-primary" />
            Data type configuration
          </span>
        }
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <InputField
            label={isEdit ? "Data Type Code (Read-only)" : "Data Type Code"}
            placeholder="e.g. email_address"
            disabled={isEdit || isPending}
            error={errors.data_type_code?.message}
            {...register("data_type_code")}
            required
            className={isEdit ? "cursor-not-allowed bg-muted text-muted-foreground opacity-100" : ""}
          />

          <InputField
            label="Display Label"
            placeholder="e.g. Email Address"
            error={errors.display_label?.message}
            disabled={isPending}
            {...register("display_label")}
            required
          />

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="e.g. Standard format for electronic mail contact addresses"
              disabled={isPending}
              {...register("description")}
              className="min-h-[96px] rounded-lg border border-input bg-inherit text-sm"
            />
            {errors.description && (
              <span className="block px-1 text-[11px] font-medium text-destructive">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="dialog-field-grid">
            <InputField
              label="Sample Value"
              placeholder="e.g. test@example.com"
              error={errors.sample_value?.message}
              disabled={isPending}
              {...register("sample_value")}
              required
            />

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

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={backToList} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Data Type"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

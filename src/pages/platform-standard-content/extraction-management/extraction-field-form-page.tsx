import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useDataTypes } from "@/api/hooks/data-types"
import { useCreateExtractionField, useExtractionField, useUpdateExtractionField } from "@/api/hooks/useExtractionFields"
import { useFieldCategories } from "@/api/hooks/useFieldCategories"
import { useReferenceLists } from "@/api/hooks/useReferenceLists"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_FIELD_VALUES,
  extractionFieldSchema,
  type ExtractionFieldFormValues,
} from "@/schemas/extraction-schema"
import type { FormStep } from "@/types"
import { FieldDialogDetailsStep, FieldDialogMeaningStep, FieldDialogRulesStep } from "./models/FieldDialogSteps"
import { FieldDialogFooterNav, FieldDialogFooterSubmit } from "./models/FieldDialogFooter"
import { FieldDialogSidebar } from "./models/FieldDialogSidebar"

const FIELD_FORM_STEPS: readonly FormStep[] = [
  {
    title: "Field details",
    description: "Category, name, type, and document section.",
    fields: ["field_id", "field_category_code", "field_label", "data_type_code", "header_item"],
  },
  {
    title: "Field meaning",
    description: "Short and long context for the extractor.",
    fields: ["short_desc", "field_long_description"],
  },
  {
    title: "Extraction rules",
    description: "Aliases, examples, allowed values, and guidance.",
    fields: [
      "labels_raw",
      "extraction_instructions_raw",
      "examples_raw",
      "allowed_value_mode",
      "allowed_static_list_raw",
      "allowed_reference_registry_key",
      "default_value",
    ],
  },
]

const FIELD_FORM_STEP_FIELDS = FIELD_FORM_STEPS.flatMap((step) => step.fields)

export function ExtractionFieldFormPage({ mode }: { mode: "create" | "edit" }) {
  const { fieldId = "" } = useParams<{ fieldId: string }>()
  const navigate = useNavigate()
  const isEdit = mode === "edit"
  const fieldQuery = useExtractionField(isEdit ? fieldId : undefined)
  const fieldItem = fieldQuery.data
  const createMutation = useCreateExtractionField()
  const updateMutation = useUpdateExtractionField()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const isFirstStep = activeStepIndex === 0
  const isLastStep = activeStepIndex === FIELD_FORM_STEPS.length - 1

  const dataTypesQuery = useDataTypes()
  const dataTypes = dataTypesQuery.data || []
  
  const categoriesQuery = useFieldCategories()
  const categories = categoriesQuery.data || []
  
  const referenceListsQuery = useReferenceLists()
  const referenceLists = referenceListsQuery.data || []

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getFieldState,
    setFocus,
    clearErrors,
    formState: { errors },
  } = useForm<ExtractionFieldFormValues>({
    resolver: zodResolver(extractionFieldSchema),
    mode: "onChange",
    values: fieldItem
      ? {
          field_id: fieldItem.field_id,
          field_label: fieldItem.field_label,
          short_desc: fieldItem.short_desc ?? "",
          field_long_description: fieldItem.field_long_description ?? "",
          data_type_code: fieldItem.data_type_code,
          labels_raw: fieldItem.labels ? fieldItem.labels.join(", ") : "",
          examples_raw: fieldItem.examples ? fieldItem.examples.join(", ") : "",
          extraction_instructions_raw: fieldItem.extraction_instructions ? fieldItem.extraction_instructions.join(", ") : "",
          header_item: fieldItem.header_item?.toLowerCase() === "item" ? "item" : "header",
          allowed_value_mode: 
            fieldItem.allowed_value_mode?.toLowerCase() === "static_list" ? "static_list" :
            fieldItem.allowed_value_mode?.toLowerCase() === "reference_list" ? "reference_list" : "any",
          allowed_static_list_raw: fieldItem.allowed_static_list ? fieldItem.allowed_static_list.join(", ") : "",
          allowed_reference_registry_key: fieldItem.allowed_reference_registry_key ?? "",
          default_value: fieldItem.default_value ?? "",
          field_category_code: fieldItem.field_category_code,
        }
      : DEFAULT_FIELD_VALUES,
  })

  const valueMode = watch("allowed_value_mode")
  const backToList = useCallback(() => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate("/platform-standard-content/extraction-management?tab=fields")
    }
  }, [navigate])

  const showStep = (stepIndex: number) => {
    clearErrors()
    setActiveStepIndex(stepIndex)
  }

  const validateStep = async (stepIndex: number) => {
    const step = FIELD_FORM_STEPS[stepIndex]
    const isValid = await trigger([...step.fields])

    if (!isValid) {
      const firstField = step.fields.find((fieldName) => getFieldState(fieldName).invalid)
      if (firstField) setFocus(firstField)
    }

    return isValid
  }

  const handlePreviousStep = () => {
    setActiveStepIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }

  const handleNextStep = async () => {
    if (!(await validateStep(activeStepIndex))) return
    showStep(Math.min(activeStepIndex + 1, FIELD_FORM_STEPS.length - 1))
  }

  const handleStepChange = async (nextStepIndex: number) => {
    if (isSaving) return
    if (nextStepIndex <= activeStepIndex) {
      showStep(nextStepIndex)
      return
    }
    if (!(await validateStep(activeStepIndex))) return
    showStep(Math.min(nextStepIndex, activeStepIndex + 1))
  }

  const handleInvalidSubmit = (formErrors: any) => {
    const firstErrorField = FIELD_FORM_STEP_FIELDS.find((fieldName) => formErrors[fieldName])
    if (!firstErrorField) return
    const firstErrorStepIndex = FIELD_FORM_STEPS.findIndex((step) => step.fields.includes(firstErrorField))
    if (firstErrorStepIndex >= 0) showStep(firstErrorStepIndex)
  }

  const onSubmit = useCallback(async (values: ExtractionFieldFormValues) => {
    const labels = values.labels_raw ? values.labels_raw.split(",").flatMap((s) => s.trim() || []) : []
    const examples = values.examples_raw ? values.examples_raw.split(",").flatMap((s) => s.trim() || []) : []
    const extraction_instructions = values.extraction_instructions_raw
      ? values.extraction_instructions_raw.split(",").flatMap((s) => s.trim() || [])
      : []
    const allowed_static_list = values.allowed_static_list_raw
      ? values.allowed_static_list_raw.split(",").flatMap((s) => s.trim() || [])
      : []

    const basePayload = {
      field_id: values.field_id,
      field_label: values.field_label,
      ...( !isEdit && { data_type_code: values.data_type_code } ),
      short_desc: values.short_desc || null,
      field_long_description: values.field_long_description || null,
      labels: labels.length > 0 ? labels : null,
      examples: examples.length > 0 ? examples : null,
    }

    const isDerived = fieldItem?.field_source_mode === "DERIVED" || fieldItem?.extraction_instructions?.some(i => i.toLowerCase().includes("derived"));

    const payload = {
      ...basePayload,
      extraction_instructions: isDerived ? [] : (extraction_instructions.length > 0 ? extraction_instructions : []),
      ...( !isEdit && { header_item: values.header_item === "item" ? "Item" : "Header" } ),
      field_source_mode: isDerived ? "DERIVED" : "EXTRACTED",
      ...( !isEdit && { 
        allowed_value_mode: values.allowed_value_mode === "static_list" ? "STATIC_LIST" : values.allowed_value_mode === "reference_list" ? "REFERENCE_LIST" : "NONE",
        allowed_static_list: values.allowed_value_mode === "static_list" ? allowed_static_list : [],
        allowed_reference_registry_key: values.allowed_value_mode === "reference_list" ? values.allowed_reference_registry_key || null : null,
      }),
      default_value: values.default_value || null,
      field_category_code: values.field_category_code,
    }

    try {
      if (isEdit && fieldItem) {
        await updateMutation.mutateAsync({ fieldId: fieldItem.field_id, payload: payload as any })
        toast.success("Extraction field updated successfully")
      } else {
        await createMutation.mutateAsync(payload as any)
        toast.success("Extraction field created successfully")
      }
      backToList()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to save field")
    }
  }, [isEdit, fieldItem, createMutation, updateMutation, backToList])

  const isAnyLoading = 
    (isEdit && fieldQuery.isLoading) || 
    dataTypesQuery.isLoading || 
    categoriesQuery.isLoading || 
    referenceListsQuery.isLoading

  if (isAnyLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isEdit && (fieldQuery.isError || !fieldItem)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load extraction field.</p>
        <Button variant="outline" size="sm" onClick={backToList}>
          Back to Extraction Fields
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={isEdit ? "Edit Extraction Field" : "Add Extraction Field"}
        description={isEdit ? "Update settings and constraints for this standard extraction field." : "Define a new standard platform content field for extraction layouts."}
      >
        <Button variant="outline" size="sm" onClick={backToList}>
          <ArrowLeft className="size-4" /> Back to Extraction Management
        </Button>
      </PageHeader>

      <SectionCard
    contentClassName="p-0"
        title={
          <span className="flex items-center gap-2 ">
            <FileText className="size-4 text-primary" />
            Field configuration
          </span>
        }
     
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!isLastStep) {
              void handleNextStep()
            } else {
              void handleSubmit(onSubmit, handleInvalidSubmit)(event)
            }
          }}
          className="min-h-[32rem]"
          noValidate
        >
          <div className="grid min-h-[32rem] md:grid-cols-[16rem_minmax(0,1fr)]">
            <FieldDialogSidebar
              activeStepIndex={activeStepIndex}
              handleStepChange={handleStepChange}
              steps={FIELD_FORM_STEPS}
            />

            <div className="min-w-0 px-5 py-5 pb-6 md:px-6 md:py-6 md:pb-8">
              {activeStepIndex === 0 ? (
                <FieldDialogDetailsStep
                  register={register}
                  errors={errors}
                  categories={categories}
                  dataTypes={dataTypes}
                  isEdit={isEdit}
                  isSaving={isSaving}
                />
              ) : null}

              {activeStepIndex === 1 ? (
                <FieldDialogMeaningStep
                  register={register}
                  errors={errors}
                  isSaving={isSaving}
                />
              ) : null}

              {activeStepIndex === 2 ? (
                <FieldDialogRulesStep
                  register={register}
                  errors={errors}
                  valueMode={valueMode}
                  referenceLists={referenceLists}
                  isSaving={isSaving}
                  isEdit={isEdit}
                />
              ) : null}
            </div>
          </div>

          <div className="dialog-form-footer sm:justify-between">
            <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={backToList}>
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <FieldDialogFooterNav
                isFirstStep={isFirstStep}
                isSaving={isSaving}
                handlePreviousStep={handlePreviousStep}
                handleNextStep={handleNextStep}
              />

              <FieldDialogFooterSubmit
                isLastStep={isLastStep}
                isSaving={isSaving}
                isEdit={isEdit}
                onSubmitClick={() => void handleSubmit(onSubmit, handleInvalidSubmit)()}
              />
            </div>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

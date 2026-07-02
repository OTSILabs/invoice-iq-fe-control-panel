import { useCallback, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useDataTypes } from "@/api/hooks/data-types"
import { useCreateExtractionField, useExtractionField, useUpdateExtractionField } from "@/api/hooks/useExtractionFields"
import { useFieldCategories } from "@/api/hooks/useFieldCategories"
import { useReferenceLists } from "@/api/hooks/useReferenceLists"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_FIELD_VALUES,
  extractionFieldSchema,
  type ExtractionFieldFormValues,
} from "@/schemas/extraction-schema"
import type { FormStep } from "@/types"
import { FieldDialogDetailsStep, FieldDialogMeaningStep, FieldDialogRulesStep } from "../models/FieldDialogSteps"
import { FieldDialogFooterNav, FieldDialogFooterSubmit } from "../models/FieldDialogFooter"
import { FieldDialogSidebar } from "../models/FieldDialogSidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface ExtractionFieldFormContentProps {
  mode: "create" | "edit"
  fieldId?: string
  onOpenChange: (open: boolean) => void
  onSuccess?: (response?: any, payload?: any) => void
}

function ExtractionFieldFormContent({
  mode,
  fieldId,
  onOpenChange,
  onSuccess,
}: ExtractionFieldFormContentProps) {
  const isEdit = mode === "edit"
  const fieldQuery = useExtractionField(isEdit && fieldId ? fieldId : undefined)
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

  const formValues = useMemo(() => {
    if (isEdit && fieldItem) {
      return {
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
      } as ExtractionFieldFormValues
    }
    return DEFAULT_FIELD_VALUES
  }, [isEdit, fieldItem])

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
    values: formValues,
  })

  const valueMode = watch("allowed_value_mode")

  const showStep = (stepIndex: number) => {
    clearErrors()
    setActiveStepIndex(stepIndex)
  }

  const validateStep = async (stepIndex: number) => {
    const fieldsToValidate = FIELD_FORM_STEPS[stepIndex].fields
    const isValid = await trigger(fieldsToValidate)

    if (!isValid) {
      const firstField = fieldsToValidate.find((fieldName) => getFieldState(fieldName).invalid)
      if (firstField) {
        setFocus(firstField)
      }
    }

    return isValid
  }

  const handlePreviousStep = () => {
    setActiveStepIndex((currentIndex) => Math.max(currentIndex - 1, 0))
  }

  const handleNextStep = async () => {
    if (!(await validateStep(activeStepIndex))) {
      return
    }
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
      let result;
      if (isEdit && fieldItem) {
        result = await updateMutation.mutateAsync({ fieldId: fieldItem.field_id, payload: payload as any })
        toast.success("Extraction field updated successfully")
      } else {
        result = await createMutation.mutateAsync(payload as any)
        toast.success("Extraction field created successfully")
      }
      onSuccess?.({ field: result }, payload)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to save field")
    }
  }, [isEdit, fieldItem, createMutation, updateMutation, onSuccess, onOpenChange])

  const isAnyLoading = 
    (isEdit && fieldQuery.isLoading) || 
    dataTypesQuery.isLoading || 
    categoriesQuery.isLoading || 
    referenceListsQuery.isLoading

  if (isAnyLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isEdit && (fieldQuery.isError || !fieldItem)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Failed to load extraction field.</p>
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!isLastStep) {
            void handleNextStep()
          } else {
            void handleSubmit(onSubmit, handleInvalidSubmit)(event)
          }
        }}
        className="h-full min-h-0 overflow-hidden"
        noValidate
      >
        <div className="grid h-full min-h-0 md:grid-cols-[16rem_minmax(0,1fr)]">
          <FieldDialogSidebar
            activeStepIndex={activeStepIndex}
            handleStepChange={handleStepChange}
            steps={FIELD_FORM_STEPS}
          />

          <ScrollArea className="h-full min-h-0 min-w-0">
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
              <div className="h-6 md:h-10" />
            </div>
          </ScrollArea>
        </div>
      </form>

      <div className="dialog-form-footer sm:justify-between border-t bg-muted/5">
        <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          <FieldDialogFooterNav
            isFirstStep={isFirstStep}
            isSaving={isSaving}
            handlePreviousStep={handlePreviousStep}
            handleNextStep={handleNextStep}
            isLastStep={isLastStep}
          />

          <FieldDialogFooterSubmit
            isLastStep={isLastStep}
            isSaving={isSaving}
            isEdit={isEdit}
            onSubmitClick={() => void handleSubmit(onSubmit, handleInvalidSubmit)()}
          />
        </div>
      </div>
    </>
  )
}

export function ExtractionFieldFormDialog({
  open,
  onOpenChange,
  mode,
  fieldId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  fieldId?: string
  onSuccess?: (response?: any, payload?: any) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid h-[min(42rem,86vh)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-3xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>
            {mode === "edit" ? "Edit Extraction Field" : "Add Extraction Field"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update settings and constraints for this standard extraction field." : "Define a new standard platform content field for extraction layouts."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ExtractionFieldFormContent
            mode={mode}
            fieldId={fieldId}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

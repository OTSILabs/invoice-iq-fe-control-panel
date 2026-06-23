import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCallback, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useCreateExtractionField, useUpdateExtractionField } from "@/api/hooks/useExtractionFields";
import { useDataTypes } from "@/api/hooks/data-types";
import { useFieldCategories } from "@/api/hooks/useFieldCategories";
import { useReferenceLists } from "@/api/hooks/useReferenceLists";
import type { FieldDialogProps, FormStep } from "@/types";
import { extractionFieldSchema, type ExtractionFieldFormValues, DEFAULT_FIELD_VALUES } from "@/schemas/extraction-schema";

import { FieldDialogDetailsStep, FieldDialogMeaningStep, FieldDialogRulesStep } from "./FieldDialogSteps";
import { FieldDialogSidebar } from "./FieldDialogSidebar";
import { FieldDialogFooterNav, FieldDialogFooterSubmit } from "./FieldDialogFooter";
import { Button } from "@/components/ui/button";

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
];

const FIELD_FORM_STEP_FIELDS = FIELD_FORM_STEPS.flatMap((step) => step.fields);



export function FieldDialog({ open, onOpenChange, fieldItem }: FieldDialogProps) {
  const isEdit = !!fieldItem;
  const createMutation = useCreateExtractionField();
  const updateMutation = useUpdateExtractionField();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === FIELD_FORM_STEPS.length - 1;

  // Load select option data
  const { data: dataTypes = [] } = useDataTypes();
  const { data: categories = [] } = useFieldCategories();
  const { data: referenceLists = [] } = useReferenceLists();

  const { register, handleSubmit, watch, trigger, getFieldState, setFocus, clearErrors, formState: { errors } } = useForm<ExtractionFieldFormValues>({
    resolver: zodResolver(extractionFieldSchema),
    mode: "onChange",
    defaultValues: fieldItem
      ? {
          field_id: fieldItem.field_id,
          field_label: fieldItem.field_label,
          short_desc: fieldItem.short_desc || "",
          field_long_description: fieldItem.field_long_description || "",
          data_type_code: fieldItem.data_type_code,
          labels_raw: fieldItem.labels ? fieldItem.labels.join(", ") : "",
          examples_raw: fieldItem.examples ? fieldItem.examples.join(", ") : "",
          extraction_instructions_raw: fieldItem.extraction_instructions ? fieldItem.extraction_instructions.join(", ") : "",
          header_item: (fieldItem.header_item as "header" | "item") || "header",
          allowed_value_mode: (fieldItem.allowed_value_mode as "any" | "static_list" | "reference_list") || "any",
          allowed_static_list_raw: fieldItem.allowed_static_list ? fieldItem.allowed_static_list.join(", ") : "",
          allowed_reference_registry_key: fieldItem.allowed_reference_registry_key || "",
          default_value: fieldItem.default_value || "",
          field_category_code: fieldItem.field_category_code,
        }
      : DEFAULT_FIELD_VALUES,
  });

  const valueMode = watch("allowed_value_mode");

  const showStep = (stepIndex: number) => {
    clearErrors();
    setActiveStepIndex(stepIndex);
  };

  const validateStep = async (stepIndex: number) => {
    const step = FIELD_FORM_STEPS[stepIndex];
    const fieldsToValidate = [...step.fields];
    const isValid = await trigger(fieldsToValidate);

    if (!isValid) {
      const firstField = step.fields.find((fieldName) => getFieldState(fieldName).invalid);
      if (firstField) {
        setFocus(firstField);
      }
    }
    return isValid;
  };

  const handlePreviousStep = () => {
    setActiveStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  const handleNextStep = async () => {
    if (!(await validateStep(activeStepIndex))) {
      return;
    }
    showStep(Math.min(activeStepIndex + 1, FIELD_FORM_STEPS.length - 1));
  };

  const handleStepChange = async (nextStepIndex: number) => {
    if (isSaving) return;
    if (nextStepIndex <= activeStepIndex) {
      showStep(nextStepIndex);
      return;
    }
    if (!(await validateStep(activeStepIndex))) {
      return;
    }
    showStep(Math.min(nextStepIndex, activeStepIndex + 1));
  };

  const handleInvalidSubmit = (formErrors: any) => {
    const firstErrorField = FIELD_FORM_STEP_FIELDS.find((fieldName) => formErrors[fieldName]);
    if (!firstErrorField) return;
    const firstErrorStepIndex = FIELD_FORM_STEPS.findIndex((step) =>
      step.fields.includes(firstErrorField)
    );
    if (firstErrorStepIndex >= 0) {
      showStep(firstErrorStepIndex);
    }
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setActiveStepIndex(0);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = useCallback(async (values: ExtractionFieldFormValues) => {
    const labels = values.labels_raw
      ? values.labels_raw.split(",").flatMap((s) => s.trim() || [])
      : [];
    const examples = values.examples_raw
      ? values.examples_raw.split(",").flatMap((s) => s.trim() || [])
      : [];
    const extraction_instructions = values.extraction_instructions_raw
      ? values.extraction_instructions_raw.split(",").flatMap((s) => s.trim() || [])
      : [];
    const allowed_static_list = values.allowed_static_list_raw
      ? values.allowed_static_list_raw.split(",").flatMap((s) => s.trim() || [])
      : [];

    const payload = {
      field_id: values.field_id,
      field_label: values.field_label,
      short_desc: values.short_desc || null,
      field_long_description: values.field_long_description || null,
      data_type_code: values.data_type_code,
      labels,
      examples,
      extraction_instructions,
      header_item: values.header_item,
      allowed_value_mode: values.allowed_value_mode,
      allowed_static_list: values.allowed_value_mode === "static_list" ? allowed_static_list : [],
      allowed_reference_registry_key: values.allowed_value_mode === "reference_list" ? values.allowed_reference_registry_key || null : null,
      default_value: values.default_value || null,
      field_category_code: values.field_category_code,
    };

    try {
      if (isEdit && fieldItem) {
        await updateMutation.mutateAsync({
          fieldId: fieldItem.field_id,
          payload,
        });
        toast.success("Extraction field updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Extraction field created successfully");
      }
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || "Failed to save field");
    }
  }, [isEdit, fieldItem, createMutation, updateMutation, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="grid h-[min(42rem,86vh)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-3xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>
            {isEdit ? "Edit Extraction Field" : "Add Extraction Field"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update settings and constraints for this standard extraction field."
              : "Define a new standard platform content field for extraction layouts."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!isLastStep) {
              void handleNextStep();
            } else {
              void handleSubmit(onSubmit, handleInvalidSubmit)(event);
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
              <div className="px-5 py-5 pb-6 md:px-6 md:py-6 md:pb-8">
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
                  />
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </form>

        <DialogFooter className="relative z-10 border-t bg-card px-5 py-3.5 sm:justify-between">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              Cancel
            </Button>
          </DialogClose>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground sm:hidden"
              >
                Cancel
              </Button>
            </DialogClose>

            <div className="flex flex-1 items-center justify-end gap-3 sm:flex-initial">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


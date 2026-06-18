import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputField } from "@/components/ui/input-field";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";

import { useCreateExtractionField, useUpdateExtractionField } from "@/api/hooks/useExtractionFields";
import { useDataTypes } from "@/api/hooks/data-types";
import { useFieldCategories } from "@/api/hooks/useFieldCategories";
import { useReferenceLists } from "@/api/hooks/useReferenceLists";
import type { StandardExtractionFieldResponse } from "@/types";
import { extractionFieldSchema, type ExtractionFieldFormValues, DEFAULT_FIELD_VALUES } from "@/schemas/extraction-schema";

interface FieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldItem: StandardExtractionFieldResponse | null;
}

export function FieldDialog({ open, onOpenChange, fieldItem }: FieldDialogProps) {
  const isEdit = !!fieldItem;
  const createMutation = useCreateExtractionField();
  const updateMutation = useUpdateExtractionField();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Load select option data
  const { data: dataTypes = [] } = useDataTypes();
  const { data: categories = [] } = useFieldCategories();
  const { data: referenceLists = [] } = useReferenceLists();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExtractionFieldFormValues>({
    resolver: zodResolver(extractionFieldSchema),
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {isEdit ? <Edit className="size-5 text-primary" /> : <PlusCircle className="size-5 text-primary" />}
            {isEdit ? "Edit Extraction Field" : "Add Extraction Field"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update settings and constraints for this standard extraction field."
              : "Define a new standard platform content field for extraction layouts."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(90vh-6rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4">
              <InputField
                id="field_id"
                label="Field ID / Code"
                required
                disabled={isEdit || isSaving}
                error={errors.field_id?.message}
                placeholder="e.g. invoice_total"
                {...register("field_id")}
              />

              <InputField
                id="field_label"
                label="UI Label"
                required
                disabled={isSaving}
                error={errors.field_label?.message}
                placeholder="e.g. Invoice Total"
                {...register("field_label")}
              />

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Data Type <span className="text-destructive">*</span></FieldLabel>
                  <NativeSelect id="data_type_code" disabled={isSaving} {...register("data_type_code")}>
                    <option value="">Select type...</option>
                    {dataTypes.map((dt) => (
                      <option key={dt.data_type_code} value={dt.data_type_code}>
                        {dt.display_label || dt.data_type_code}
                      </option>
                    ))}
                  </NativeSelect>
                  {errors.data_type_code?.message && (
                    <FieldError>{errors.data_type_code.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Field Category <span className="text-destructive">*</span></FieldLabel>
                  <NativeSelect id="field_category_code" disabled={isSaving} {...register("field_category_code")}>
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.field_category_code} value={cat.field_category_code}>
                        {cat.ui_label || cat.field_category_code}
                      </option>
                    ))}
                  </NativeSelect>
                  {errors.field_category_code?.message && (
                    <FieldError>{errors.field_category_code.message}</FieldError>
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Header or Line Item <span className="text-destructive">*</span></FieldLabel>
                  <NativeSelect id="header_item" disabled={isSaving} {...register("header_item")}>
                    <option value="header">Header Field</option>
                    <option value="item">Line Item Field</option>
                  </NativeSelect>
                  {errors.header_item?.message && (
                    <FieldError>{errors.header_item.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Allowed Value Mode <span className="text-destructive">*</span></FieldLabel>
                  <NativeSelect id="allowed_value_mode" disabled={isSaving} {...register("allowed_value_mode")}>
                    <option value="any">Any (Unrestricted)</option>
                    <option value="static_list">Static List</option>
                    <option value="reference_list">Reference List</option>
                  </NativeSelect>
                  {errors.allowed_value_mode?.message && (
                    <FieldError>{errors.allowed_value_mode.message}</FieldError>
                  )}
                </Field>
              </div>

              {valueMode === "static_list" && (
                <InputField
                  id="allowed_static_list_raw"
                  label="Static Allowed Values (Comma-separated)"
                  required
                  disabled={isSaving}
                  error={errors.allowed_static_list_raw?.message}
                  placeholder="e.g. active, pending, suspended"
                  {...register("allowed_static_list_raw")}
                />
              )}

              {valueMode === "reference_list" && (
                <Field>
                  <FieldLabel>Allowed Reference List Key <span className="text-destructive">*</span></FieldLabel>
                  <NativeSelect
                    id="allowed_reference_registry_key"
                    disabled={isSaving}
                    {...register("allowed_reference_registry_key")}
                  >
                    <option value="">Select reference list...</option>
                    {referenceLists.map((ref) => (
                      <option key={ref.registry_key} value={ref.registry_key}>
                        {ref.display_label || ref.registry_key}
                      </option>
                    ))}
                  </NativeSelect>
                  {errors.allowed_reference_registry_key?.message && (
                    <FieldError>{errors.allowed_reference_registry_key.message}</FieldError>
                  )}
                </Field>
              )}

              <InputField
                id="default_value"
                label="Default Value"
                disabled={isSaving}
                error={errors.default_value?.message}
                placeholder="e.g. 0.00"
                {...register("default_value")}
              />

              <div className="space-y-1">
                <FieldLabel>Short Description</FieldLabel>
                <Textarea
                  id="short_desc"
                  disabled={isSaving}
                  className="h-16 text-xs resize-none"
                  placeholder="Brief summary of what this field extracts..."
                  {...register("short_desc")}
                />
              </div>

              <div className="space-y-1">
                <FieldLabel>Detailed Description</FieldLabel>
                <Textarea
                  id="field_long_description"
                  disabled={isSaving}
                  className="h-20 text-xs"
                  placeholder="Full description or markdown rules for parsing..."
                  {...register("field_long_description")}
                />
              </div>

              <InputField
                id="labels_raw"
                label="Alternate Labels (Comma-separated)"
                disabled={isSaving}
                error={errors.labels_raw?.message}
                placeholder="e.g. Total Amt, Total, Gross Amount"
                {...register("labels_raw")}
              />

              <InputField
                id="examples_raw"
                label="Examples (Comma-separated)"
                disabled={isSaving}
                error={errors.examples_raw?.message}
                placeholder="e.g. $150.00, 105.20"
                {...register("examples_raw")}
              />

              <InputField
                id="extraction_instructions_raw"
                label="Extraction Instructions (Comma-separated)"
                disabled={isSaving}
                error={errors.extraction_instructions_raw?.message}
                placeholder="e.g. Extract the value next to 'TOTAL', strip currency symbols"
                {...register("extraction_instructions_raw")}
              />
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-border px-6 py-4 bg-muted/30">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="cursor-pointer" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Field"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

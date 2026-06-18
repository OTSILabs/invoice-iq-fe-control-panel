import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LayoutGrid, Edit, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputField } from "@/components/ui/input-field";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

import { useCreateExtractionTemplate, useUpdateExtractionTemplate } from "@/api/hooks/useExtractionTemplates";
import { useExtractionFields } from "@/api/hooks/useExtractionFields";
import type { StandardExtractionTemplateResponse } from "@/types";
import { extractionTemplateSchema, type ExtractionTemplateFormValues, DEFAULT_TEMPLATE_VALUES } from "@/schemas/extraction-schema";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateItem: StandardExtractionTemplateResponse | null;
}

export function TemplateDialog({ open, onOpenChange, templateItem }: TemplateDialogProps) {
  const isEdit = !!templateItem;
  const createMutation = useCreateExtractionTemplate();
  const updateMutation = useUpdateExtractionTemplate();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Load standard fields for membership selection
  const { data: availableFields = [], isLoading: isFieldsLoading } = useExtractionFields();
  const [filterQuery, setFilterQuery] = useState("");

  const { register, handleSubmit, control, formState: { errors } } = useForm<ExtractionTemplateFormValues>({
    resolver: zodResolver(extractionTemplateSchema),
    defaultValues: templateItem
      ? {
          template_id: templateItem.template_id,
          name: templateItem.name,
          description: templateItem.description || "",
          business_process_tags_raw: templateItem.business_process_tags ? templateItem.business_process_tags.join(", ") : "",
          document_type_tags_raw: templateItem.document_type_tags ? templateItem.document_type_tags.join(", ") : "",
          taxation_tags_raw: templateItem.taxation_tags ? templateItem.taxation_tags.join(", ") : "",
          field_ids: templateItem.field_membership
            ? templateItem.field_membership.map((m) => m.field.field_id)
            : [],
        }
      : DEFAULT_TEMPLATE_VALUES,
  });

  const filteredFields = useMemo(() => {
    if (!filterQuery.trim()) return availableFields;
    const query = filterQuery.toLowerCase();
    return availableFields.filter(
      (f) =>
        f.field_id.toLowerCase().includes(query) ||
        f.field_label.toLowerCase().includes(query)
    );
  }, [availableFields, filterQuery]);

  const onSubmit = useCallback(async (values: ExtractionTemplateFormValues) => {
    const business_process_tags = values.business_process_tags_raw
      ? values.business_process_tags_raw.split(",").flatMap((s) => s.trim() || [])
      : [];
    const document_type_tags = values.document_type_tags_raw
      ? values.document_type_tags_raw.split(",").flatMap((s) => s.trim() || [])
      : [];
    const taxation_tags = values.taxation_tags_raw
      ? values.taxation_tags_raw.split(",").flatMap((s) => s.trim() || [])
      : [];

    // Map list of field_ids into required field_membership payload with sort_sequence
    const field_membership = values.field_ids.map((fieldId, index) => ({
      field_id: fieldId,
      sort_sequence: index + 1,
    }));

    const payload = {
      template_id: values.template_id,
      name: values.name,
      description: values.description || null,
      business_process_tags,
      document_type_tags,
      taxation_tags,
      field_membership,
    };

    try {
      if (isEdit && templateItem) {
        await updateMutation.mutateAsync({
          templateId: templateItem.template_id,
          payload,
        });
        toast.success("Extraction template updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Extraction template created successfully");
      }
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || "Failed to save template");
    }
  }, [isEdit, templateItem, createMutation, updateMutation, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {isEdit ? <Edit className="size-5 text-primary" /> : <LayoutGrid className="size-5 text-primary" />}
            {isEdit ? "Edit Base Template" : "Add Base Template"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update standard settings and field memberships for this extraction template."
              : "Define a new base template to outline key fields to be extracted from invoices."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(90vh-6rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4">
              <InputField
                id="template_id"
                label="Template ID / Code"
                required
                disabled={isEdit || isSaving}
                error={errors.template_id?.message}
                placeholder="e.g. standard_invoice"
                {...register("template_id")}
              />

              <InputField
                id="name"
                label="Template Name"
                required
                disabled={isSaving}
                error={errors.name?.message}
                placeholder="e.g. Standard Invoice Layout"
                {...register("name")}
              />

              <div className="space-y-1">
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  id="description"
                  disabled={isSaving}
                  className="h-16 text-xs resize-none"
                  placeholder="Describe the target layouts or formats this template supports..."
                  {...register("description")}
                />
              </div>

              {/* Tag Configurations */}
              <div className="grid grid-cols-3 gap-3">
                <InputField
                  id="business_process_tags_raw"
                  label="Process Tags"
                  disabled={isSaving}
                  placeholder="e.g. ap, procurement"
                  {...register("business_process_tags_raw")}
                />

                <InputField
                  id="document_type_tags_raw"
                  label="Doc Tags"
                  disabled={isSaving}
                  placeholder="e.g. invoice, receipt"
                  {...register("document_type_tags_raw")}
                />

                <InputField
                  id="taxation_tags_raw"
                  label="Tax Tags"
                  disabled={isSaving}
                  placeholder="e.g. vat, sales_tax"
                  {...register("taxation_tags_raw")}
                />
              </div>

              {/* Field Memberships Select */}
              <Field className="flex flex-col gap-1.5">
                <FieldLabel>Select Fields to Include <span className="text-destructive">*</span></FieldLabel>
                <div className="flex items-center gap-2 border border-input rounded-lg px-3 py-1.5 bg-background mb-1">
                  <Search className="size-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search extraction fields..."
                    aria-label="Search extraction fields"
                    className="flex-1 text-xs bg-transparent border-0 outline-none p-0 focus:ring-0"
                    disabled={isSaving}
                  />
                </div>

                <div className="border border-border rounded-lg bg-card overflow-hidden">
                  {isFieldsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <span className="text-xs">Loading fields...</span>
                    </div>
                  ) : filteredFields.length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground">
                      {filterQuery ? "No fields match search query." : "No extraction fields available."}
                    </div>
                  ) : (
                    <ScrollArea className="h-44">
                      <Controller
                        name="field_ids"
                        control={control}
                        render={({ field: { value = [], onChange } }) => (
                          <div className="p-3 space-y-2">
                            {filteredFields.map((f) => {
                              const checked = value.includes(f.field_id);
                              return (
                                <div key={f.field_id} className="flex items-start gap-2.5">
                                  <Checkbox
                                    id={`field-${f.field_id}`}
                                    checked={checked}
                                    disabled={isSaving}
                                    className="mt-0.5"
                                    onCheckedChange={(isChecked) => {
                                      if (isChecked) {
                                        onChange([...value, f.field_id]);
                                      } else {
                                        onChange(value.filter((id: string) => id !== f.field_id));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`field-${f.field_id}`}
                                    className="text-xs text-foreground font-medium leading-none cursor-pointer flex flex-col gap-0.5 select-none"
                                  >
                                    <span>{f.field_label}</span>
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      {f.field_id} ({f.header_item})
                                    </span>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      />
                    </ScrollArea>
                  )}
                </div>
                {errors.field_ids?.message && (
                  <FieldError>{errors.field_ids.message}</FieldError>
                )}
              </Field>
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
              {isEdit ? "Save Changes" : "Add Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

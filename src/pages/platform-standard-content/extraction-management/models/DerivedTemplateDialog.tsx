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

import { useCreateDerivedTemplate, useUpdateDerivedTemplate } from "@/api/hooks/useDerivedTemplates";
import { useExtractionTemplates } from "@/api/hooks/useExtractionTemplates";
import type { StandardDerivedTemplateResponse } from "@/types";
import { derivedTemplateSchema, type DerivedTemplateFormValues, DEFAULT_DERIVED_TEMPLATE_VALUES } from "@/schemas/extraction-schema";

interface DerivedTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  derivedItem: StandardDerivedTemplateResponse | null;
}

export function DerivedTemplateDialog({ open, onOpenChange, derivedItem }: DerivedTemplateDialogProps) {
  const isEdit = !!derivedItem;
  const createMutation = useCreateDerivedTemplate();
  const updateMutation = useUpdateDerivedTemplate();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Load base templates for selection
  const { data: baseTemplates = [] } = useExtractionTemplates();

  const { register, handleSubmit, formState: { errors } } = useForm<DerivedTemplateFormValues>({
    resolver: zodResolver(derivedTemplateSchema),
    defaultValues: derivedItem
      ? {
          derived_template_id: derivedItem.derived_template_id,
          template_id: derivedItem.template_id,
          name: derivedItem.name,
          description: derivedItem.description || "",
        }
      : DEFAULT_DERIVED_TEMPLATE_VALUES,
  });

  const onSubmit = useCallback(async (values: DerivedTemplateFormValues) => {
    try {
      if (isEdit && derivedItem) {
        await updateMutation.mutateAsync({
          derivedTemplateId: derivedItem.derived_template_id,
          payload: {
            name: values.name,
            description: values.description || null,
          },
        });
        toast.success("Derived template updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Derived template created successfully");
      }
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || "Failed to save derived template");
    }
  }, [isEdit, derivedItem, createMutation, updateMutation, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {isEdit ? <Edit className="size-5 text-primary" /> : <PlusCircle className="size-5 text-primary" />}
            {isEdit ? "Edit Derived Template" : "Add Derived Template"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update description and configuration properties for this derived template."
              : "Derive a new layout template from an existing standard base template."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(85vh-5.5rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4">
              <InputField
                id="derived_template_id"
                label="Derived Template ID / Code"
                required
                disabled={isEdit || isSaving}
                error={errors.derived_template_id?.message}
                placeholder="e.g. sap_invoice_v2"
                {...register("derived_template_id")}
              />

              <Field>
                <FieldLabel>Base Extraction Template <span className="text-destructive">*</span></FieldLabel>
                <NativeSelect id="template_id" disabled={isEdit || isSaving} {...register("template_id")}>
                  <option value="">Select base template...</option>
                  {baseTemplates.map((bt) => (
                    <option key={bt.template_id} value={bt.template_id}>
                      {bt.name || bt.template_id}
                    </option>
                  ))}
                </NativeSelect>
                {errors.template_id?.message && (
                  <FieldError>{errors.template_id.message}</FieldError>
                )}
              </Field>

              <InputField
                id="name"
                label="Name"
                required
                disabled={isSaving}
                error={errors.name?.message}
                placeholder="e.g. SAP Vendor Extraction Layout"
                {...register("name")}
              />

              <div className="space-y-1">
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  id="description"
                  disabled={isSaving}
                  className="h-20 text-xs resize-none"
                  placeholder="Details about vendor customizations or specific mapping configurations..."
                  {...register("description")}
                />
              </div>
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
              {isEdit ? "Save Changes" : "Create Derived"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

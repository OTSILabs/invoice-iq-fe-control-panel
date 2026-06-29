import * as React from "react";
import { useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/invoice-ui/design-system";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { CategorizedFieldSelector } from "@/components/ui/categorized-field-selector";
import { useCreateDerivedTemplate, useUpdateDerivedTemplate } from "@/api/hooks/useDerivedTemplates";
import { useExtractionFields } from "@/api/hooks/useExtractionFields";
import { useErpSettings } from "@/api/hooks/useErp";
import type { StandardDerivedTemplateResponse } from "@/types";
import { toast } from "sonner";

const derivedTemplateSchema = z.object({
  derived_template_id: z.string().trim().optional(),
  erp_type: z.string().trim().min(1, "ERP Type selection is required."),
  document_type_code: z.string().trim().min(1, "Document Type Code is required."),
  derived_field_ids: z.array(z.string()).min(1, "At least one derived field must be selected."),
  name: z
    .string()
    .trim()
    .min(1, "Derived template name is required.")
    .max(255, "Name must be 255 characters or fewer."),
  description: z.string().trim(),
  is_active: z.boolean().optional(),
});

type DerivedTemplateFormValues = z.infer<typeof derivedTemplateSchema>;

interface DerivedTemplateFormProps {
  mode: "create" | "edit";
  template?: StandardDerivedTemplateResponse | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function DerivedTemplateForm({ mode, template, onCancel, onSuccess }: DerivedTemplateFormProps) {
  const isEdit = mode === "edit";
  const createMutation = useCreateDerivedTemplate();
  const updateMutation = useUpdateDerivedTemplate();
  const { data: erpSettings } = useErpSettings();
  const { data: extractionFields = [] } = useExtractionFields();

  const derivedFields = extractionFields.filter(f => f.field_source_mode === "DERIVED");

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const knownItems = React.useMemo(() => {
    return derivedFields.map((f: any) => ({
      id: f.field_id,
      label: f.name || f.field_label || f.field_id,
      description: f.description,
      categoryId: "derived",
      metadata: {
        type: f.data_type,
        position: f.header_item || "Header",
      },
    }));
  }, [derivedFields]);

  const categories = React.useMemo(() => {
    return [{ 
      id: "derived", 
      label: "Derived Fields",
      activeFieldCount: derivedFields.length,
      inactiveFieldCount: 0
    }];
  }, [derivedFields.length]);

  const form = useForm<DerivedTemplateFormValues>({
    resolver: zodResolver(derivedTemplateSchema),
    mode: "onChange",
    defaultValues: template
      ? {
          derived_template_id: template.derived_template_id,
          erp_type: template.erp_type || "",
          document_type_code: template.document_type_code || "",
          derived_field_ids: (template as any).field_membership?.map((fm: any) => fm.field_id) || [],
          name: template.name,
          description: template.description || "",
          is_active: template.is_active ?? true,
        }
      : {
          derived_template_id: "",
          erp_type: "",
          document_type_code: "",
          derived_field_ids: [],
          name: "",
          description: "",
          is_active: true,
        },
  });

  const selectedErpType = form.watch("erp_type");
  const selectedDocTypeCode = form.watch("document_type_code");

  useEffect(() => {
    if (!isEdit && selectedErpType && selectedDocTypeCode) {
      form.setValue("derived_template_id", `${selectedErpType}:${selectedDocTypeCode}`, { shouldValidate: true });
    }
  }, [selectedErpType, selectedDocTypeCode, isEdit, form]);

  const onSubmit = useCallback(async (values: DerivedTemplateFormValues) => {
    try {
      if (isEdit && template) {
        await updateMutation.mutateAsync({
          derivedTemplateId: template.derived_template_id,
          payload: {
            name: values.name,
            description: values.description || null,
            is_active: values.is_active,
          },
        });
        toast.success("Derived template updated successfully");
      } else {
        const field_membership = values.derived_field_ids.map((fieldId, index) => {
            const canonicalField = extractionFields.find(f => f.field_id === fieldId);
            return {
                field_id: fieldId,
                header_item: canonicalField?.header_item || "Header",
                sort_sequence: index + 1,
                is_required: false,
                implementation_key: "default",
                input_field_ids: [],
                params: {},
                execution_stage: "POST_NORMALIZATION",
                failure_policy: "RETURN_NULL",
                is_active: true
            };
        });

        const payload = {
          derived_template_id: `${values.erp_type}:${values.document_type_code}`,
          name: values.name,
          description: values.description || null,
          erp_type: values.erp_type,
          document_type_code: values.document_type_code,
          is_active: true,
          field_membership
        };

        await createMutation.mutateAsync(payload as any);
        toast.success("Derived template created successfully");
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || "Failed to save derived template");
    }
  }, [isEdit, template, createMutation, updateMutation, onSuccess, extractionFields]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <SectionCard contentClassName="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>ERP Type</FieldLabel>
              <Controller
                control={form.control}
                name="erp_type"
                render={({ field }) => (
                  <NativeSelect
                    disabled={isSaving}
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue("document_type_code", "");
                    }}
                  >
                    <option value="" disabled>Select ERP Type</option>
                    {erpSettings?.map((erp: any) => (
                      <option key={erp.erp_type} value={erp.erp_type}>
                        {erp.display_name || erp.erp_type}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              />
              {form.formState.errors.erp_type && (
                <FieldError errors={[form.formState.errors.erp_type]} />
              )}
            </Field>

            <Field>
              <FieldLabel>Document Type Code</FieldLabel>
              <Controller
                control={form.control}
                name="document_type_code"
                render={({ field }) => (
                  <Input
                    placeholder="e.g. PO_INVOICE"
                    disabled={!selectedErpType || isSaving}
                    {...field}
                  />
                )}
              />
              {form.formState.errors.document_type_code && (
                <FieldError errors={[form.formState.errors.document_type_code]} />
              )}
            </Field>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Derived Template ID</FieldLabel>
            <Input
              placeholder="e.g. SAP:PO_INVOICE"
              disabled={true}
              {...form.register("derived_template_id")}
            />
            {form.formState.errors.derived_template_id && (
              <FieldError errors={[form.formState.errors.derived_template_id]} />
            )}
            <p className="text-xs text-muted-foreground mt-1">Auto-generated from ERP Type and Document Type Code.</p>
          </Field>
          
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              placeholder="e.g. My Custom Invoice Template"
              disabled={isSaving}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <FieldError errors={[form.formState.errors.name]} />
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel>Select Derived Fields</FieldLabel>
          <Controller
            control={form.control}
            name="derived_field_ids"
            render={({ field }) => (
              <CategorizedFieldSelector
                categories={categories as any}
                knownItems={knownItems as any}
                selectedIds={field.value}
                onSelectedChange={field.onChange}
                onSelectAll={() => {
                  const allIds = knownItems.map((i: any) => i.id);
                  field.onChange(allIds);
                  return allIds;
                }}
                loadCategoryItems={async () => knownItems as any}
                getCategoryItemsQueryKey={() => ["derived-items"]}
                loadSearchItems={async (search) => {
                  const s = search.toLowerCase();
                  return knownItems.filter(i => i.label.toLowerCase().includes(s)) as any;
                }}
                getSearchItemsQueryKey={(search) => ["derived-search", search]}
                disabled={isSaving}
              />
            )}
          />
          {form.formState.errors.derived_field_ids && (
            <FieldError errors={[form.formState.errors.derived_field_ids]} />
          )}
        </Field>

        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea
            placeholder="Describe the purpose of this derived template"
            disabled={isSaving}
            className="min-h-[100px]"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <FieldError errors={[form.formState.errors.description]} />
          )}
        </Field>
      </SectionCard>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={onCancel}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEdit ? "Save Changes" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}

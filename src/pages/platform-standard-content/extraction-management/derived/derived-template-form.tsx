import * as React from "react";
import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/invoice-ui/design-system";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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

  const derivedFields = extractionFields.filter(f => {
    const mode = f.field_source_mode?.toUpperCase();
    return mode === "DERIVED" || mode === "BOTH";
  });
  console.log("Derived fields:", derivedFields ,derivedFields.length);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const knownItems = React.useMemo(() => {
    return derivedFields.map((f: any) => {
      const categoryId = f.field_category?.field_category_code || f.category_code || "uncategorized";
      return {
        id: f.field_id,
        label: f.name || f.field_label || f.field_id,
        description: f.description,
        categoryId: categoryId,
        metadata: {
          type: f.data_type,
          position: f.header_item || "Header",
        },
      };
    });
  }, [derivedFields]);

  const categories = React.useMemo(() => {
    const categoriesMap = new Map<string, any>();
    
    derivedFields.forEach((field: any) => {
      if (field.field_category) {
        categoriesMap.set(field.field_category.field_category_code, field.field_category);
      }
    });

    const extractedCategories = Array.from(categoriesMap.values()).map(cat => ({
      id: cat.field_category_code,
      label: cat.ui_label || cat.field_category_code,
      description: cat.description,
      sortOrder: cat.sort_sequence || Number.MAX_SAFE_INTEGER,
      activeFieldCount: derivedFields.filter((f: any) => f.field_category?.field_category_code === cat.field_category_code).length,
    }));

    // Add an 'uncategorized' category if there are fields without a category
    const uncategorizedCount = derivedFields.filter((f: any) => !f.field_category).length;
    if (uncategorizedCount > 0) {
      extractedCategories.push({
        id: "uncategorized",
        label: "Uncategorized",
        description: "",
        sortOrder: Number.MAX_SAFE_INTEGER,
        activeFieldCount: uncategorizedCount,
      });
    }

    return extractedCategories.sort((a, b) => {
      const sortDifference = a.sortOrder - b.sortOrder;
      return sortDifference || a.label.localeCompare(b.label);
    });
  }, [derivedFields]);

  const form = useForm<DerivedTemplateFormValues>({
    resolver: zodResolver(derivedTemplateSchema),
    mode: "onChange",
    values: template
      ? {
          derived_template_id: template.derived_template_id,
          erp_type: template.erp_type || "",
          document_type_code: template.document_type_code || "",
          derived_field_ids: (template as any).field_membership?.flatMap((fm: any) => {
            const val = fm.field_id || fm.field_code || (fm.derived_template_field_id ? fm.derived_template_field_id.split(':').pop() : "")
            return val ? [val] : []
          }) || [],
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
  // const selectedDocTypeCode = form.watch("document_type_code");



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

  const formId = `derived-template-form-${mode}`;

  return (
    <SectionCard className="overflow-visible" contentClassName="p-0">
      <div className="p-4 sm:p-5">
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-5">
            {!isEdit && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                          form.setValue("derived_template_id", "");
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
                        onChange={(e) => {
                          field.onChange(e);
                          const erpType = form.getValues("erp_type");
                          const docType = e.target.value;
                          if (erpType && docType) {
                            form.setValue("derived_template_id", `${erpType}:${docType}`, { shouldValidate: true });
                          } else {
                            form.setValue("derived_template_id", "");
                          }
                        }}
                      />
                    )}
                  />
                  {form.formState.errors.document_type_code && (
                    <FieldError errors={[form.formState.errors.document_type_code]} />
                  )}
                </Field>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                render={({ field }) => {
                  const selectedIds = Array.isArray(field.value) ? field.value : [];
                  return (
                  <CategorizedFieldSelector
                    categories={categories as any}
                    knownItems={knownItems as any}
                    selectedIds={selectedIds}
                    onSelectedChange={field.onChange}
                    onSelectAll={() => {
                      const allIds = knownItems.map((i: any) => i.id);
                      field.onChange(allIds);
                      return allIds;
                    }}
                    loadCategoryItems={async (category: any) => {
                      const items = knownItems.filter((i: any) => i.categoryId === category.id);
                      return { items, total: items.length };
                    }}
                    getCategoryItemsQueryKey={(category) => ["derived-items", category.id]}
                    loadSearchItems={async (search) => {
                      const s = search.toLowerCase();
                      const items = knownItems.filter(i => 
                        i.label.toLowerCase().includes(s) || 
                        (i.description && i.description.toLowerCase().includes(s))
                      );
                      return { items, total: items.length };
                    }}
                    getSearchItemsQueryKey={(search) => ["derived-search", search]}
                    disabled={isSaving}
                  />
                )}}
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
          </FieldGroup>
        </form>
      </div>

      <div className="dialog-form-footer">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={onCancel}
        >
          <X className="size-4" data-icon="inline-start" />
          Cancel
        </Button>
        <Button type="submit" form={formId} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : isEdit ? (
            <Save className="size-4" data-icon="inline-start" />
          ) : (
            <Plus className="size-4" data-icon="inline-start" />
          )}
          {isEdit ? "Save Changes" : "Create Template"}
        </Button>
      </div>
    </SectionCard>
  );
}

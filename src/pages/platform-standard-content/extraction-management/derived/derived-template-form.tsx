import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { useCreateDerivedTemplate, useUpdateDerivedTemplate } from "@/api/hooks/useDerivedTemplates";
import { useExtractionTemplates } from "@/api/hooks/useExtractionTemplates";
import type { StandardDerivedTemplateResponse } from "@/types";
import { toast } from "sonner";

const derivedTemplateSchema = z.object({
  derived_template_id: z
    .string()
    .trim()
    .min(1, "Derived template ID is required.")
    .max(100, "ID must be 100 characters or fewer.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores are allowed."),
  template_id: z.string().trim().min(1, "Base template selection is required."),
  name: z
    .string()
    .trim()
    .min(1, "Derived template name is required.")
    .max(255, "Name must be 255 characters or fewer."),
  description: z.string().trim(),
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
  const { data: baseTemplates = [] } = useExtractionTemplates();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const form = useForm<DerivedTemplateFormValues>({
    resolver: zodResolver(derivedTemplateSchema),
    mode: "onChange",
    defaultValues: template
      ? {
          derived_template_id: template.derived_template_id,
          template_id: template.template_id,
          name: template.name,
          description: template.description || "",
        }
      : {
          derived_template_id: "",
          template_id: "",
          name: "",
          description: "",
        },
  });

  const onSubmit = useCallback(async (values: DerivedTemplateFormValues) => {
    try {
      if (isEdit && template) {
        await updateMutation.mutateAsync({
          derivedTemplateId: template.derived_template_id,
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
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || "Failed to save derived template");
    }
  }, [isEdit, template, createMutation, updateMutation, onSuccess]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card className="rounded-xl border border-border shadow-xs max-w-2xl bg-white p-6">
        <CardContent className="space-y-4 p-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Derived Template ID</FieldLabel>
              <Input
                placeholder="e.g. custom_invoice_template"
                disabled={isEdit || isSaving}
                {...form.register("derived_template_id")}
              />
              {form.formState.errors.derived_template_id && (
                <FieldError errors={[form.formState.errors.derived_template_id]} />
              )}
            </Field>

            <Field>
              <FieldLabel>Base Template</FieldLabel>
              <NativeSelect
                disabled={isEdit || isSaving}
                {...form.register("template_id")}
              >
                <option value="">Select standard base template</option>
                {baseTemplates.map((t) => (
                  <option key={t.template_id} value={t.template_id}>
                    {t.name} ({t.template_id})
                  </option>
                ))}
              </NativeSelect>
              {form.formState.errors.template_id && (
                <FieldError errors={[form.formState.errors.template_id]} />
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              placeholder="e.g. My Custom Derived Template"
              disabled={isSaving}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <FieldError errors={[form.formState.errors.name]} />
            )}
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              placeholder="Provide a detailed description of the template's purpose and usage..."
              disabled={isSaving}
              rows={4}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <FieldError errors={[form.formState.errors.description]} />
            )}
          </Field>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-3 mt-6 border-t pt-4 px-0 pb-0 bg-transparent">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onCancel}
          >
            <X className="size-4 mr-2" /> Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" /> Save Template
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

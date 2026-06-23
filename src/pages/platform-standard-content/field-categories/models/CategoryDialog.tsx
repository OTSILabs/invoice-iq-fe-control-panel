import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2, Tags} from "lucide-react";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";
import {InputField} from "@/components/ui/input-field";
import {Field, FieldLabel, FieldError} from "@/components/ui/field";

import {useCreateFieldCategory, useUpdateFieldCategory} from "@/api/hooks/useFieldCategories";
import type {CategoryDialogProps} from "@/types";
import {fieldCategorySchema, type FieldCategoryFormValues, DEFAULT_FIELD_CATEGORY_VALUES} from "@/schemas/field-category-schema";



export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const isEdit = !!category
  const createMutation = useCreateFieldCategory()
  const updateMutation = useUpdateFieldCategory()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<FieldCategoryFormValues>({
    resolver: zodResolver(fieldCategorySchema),
    defaultValues: category
      ? {
          field_category_code: category.field_category_code,
          ui_label: category.ui_label,
          description: category.description,
          example_fields_raw: category.example_fields ? category.example_fields.join(", ") : "",
          sort_sequence: category.sort_sequence,
        }
      : DEFAULT_FIELD_CATEGORY_VALUES
  })

  const onSubmit = async (values: FieldCategoryFormValues) => {
    const example_fields = values.example_fields_raw
      ? values.example_fields_raw.split(",").flatMap((s: string) => {
          const trimmed = s.trim()
          return trimmed ? [trimmed] : []
        })
      : []

    const payload = {
      field_category_code: values.field_category_code,
      ui_label: values.ui_label,
      description: values.description,
      example_fields,
      sort_sequence: values.sort_sequence,
    }

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          code: category.field_category_code,
          payload
        })
        toast.success("Field category updated successfully")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Field category created successfully")
      }
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || err.message || "Failed to save category")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Tags className="size-5 text-primary" />
            {isEdit ? "Edit Field Category" : "Add Field Category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Update the details for this platform standard field category." 
              : "Create a new platform standard category to organize extraction fields."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="dialog-form" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="dialog-form-body">
              <InputField
                id="field_category_code"
                label="Field Category Code"
                required
                disabled={isEdit || isSaving}
                error={errors.field_category_code?.message}
                placeholder="e.g. invoice_header"
                {...register("field_category_code")}
              />

              <InputField
                id="ui_label"
                label="UI Label"
                required
                disabled={isSaving}
                error={errors.ui_label?.message}
                placeholder="e.g. Invoice Header"
                {...register("ui_label")}
              />

              <Field>
                <FieldLabel htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                  <span className="text-destructive ml-0.5">*</span>
                </FieldLabel>
                <Textarea
                  id="description"
                  disabled={isSaving}
                  placeholder="Describe what fields belong in this category..."
                  className="min-h-[80px] rounded-lg border border-input bg-inherit px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"
                  {...register("description")}
                />
                {errors.description && (
                  <FieldError>{errors.description.message}</FieldError>
                )}
              </Field>

              <InputField
                id="example_fields_raw"
                label="Example Fields (comma-separated)"
                disabled={isSaving}
                placeholder="e.g. invoice_id, invoice_date, vendor_name"
                description="Separate fields with commas."
                {...register("example_fields_raw")}
              />

              <InputField
                id="sort_sequence"
                label="Sort Sequence"
                type="number"
                required
                disabled={isSaving}
                error={errors.sort_sequence?.message}
                placeholder="1"
                {...register("sort_sequence", { valueAsNumber: true })}
              />
            </div>
          </ScrollArea>

          <DialogFooter className="dialog-form-footer">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="cursor-pointer">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

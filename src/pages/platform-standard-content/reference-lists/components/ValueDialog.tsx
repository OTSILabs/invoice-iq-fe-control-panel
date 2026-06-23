import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2, PlusCircle, Edit} from "lucide-react";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {InputField} from "@/components/ui/input-field";
import {Field, FieldLabel, FieldError} from "@/components/ui/field";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";

import {useCreateReferenceValue, useUpdateReferenceValue, useReferenceValueDetail} from "@/api/hooks/useReferenceLists";
import type {ValueDialogProps} from "@/types";
import {referenceValueSchema, type ReferenceValueFormValues, DEFAULT_VALUE_VALUES} from "@/schemas/reference-schema";



export function ValueDialog({ open, onOpenChange, registryKey, valueItem }: ValueDialogProps) {
  const isEdit = !!valueItem
  const createMutation = useCreateReferenceValue()
  const updateMutation = useUpdateReferenceValue()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const { data: latestValue } = useReferenceValueDetail(registryKey, isEdit ? (valueItem?.value_code || "") : "")

  if (latestValue) {
    console.debug("Editing reference value details fetched:", latestValue.value_code)
  }

  const { register, handleSubmit, formState: { errors } } = useForm<ReferenceValueFormValues>({
    resolver: zodResolver(referenceValueSchema) as any,
    defaultValues: valueItem
      ? {
          value_code: valueItem.value_code,
          value_label: valueItem.value_label,
          description: valueItem.description || "",
          sort_sequence: valueItem.sort_sequence,
          attributes_raw: valueItem.attributes ? JSON.stringify(valueItem.attributes, null, 2) : "",
        }
      : DEFAULT_VALUE_VALUES
  })

  const onSubmit = async (values: ReferenceValueFormValues) => {
    let attributes = null
    if (values.attributes_raw && values.attributes_raw.trim()) {
      try {
        attributes = JSON.parse(values.attributes_raw)
      } catch (err) {
        toast.error("Invalid attributes JSON format")
        return
      }
    }

    const payload = {
      value_code: values.value_code,
      value_label: values.value_label,
      description: values.description,
      sort_sequence: values.sort_sequence,
      attributes,
    }

    try {
      if (isEdit && valueItem) {
        await updateMutation.mutateAsync({
          key: registryKey,
          valueCode: valueItem.value_code,
          payload
        })
        toast.success("Reference value updated successfully")
      } else {
        await createMutation.mutateAsync({
          key: registryKey,
          payload
        })
        toast.success("Reference value added successfully")
      }
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || err.message || "Failed to save reference value")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {isEdit ? <Edit className="size-5 text-primary" /> : <PlusCircle className="size-5 text-primary" />}
            {isEdit ? "Edit Reference Value" : "Add Reference Value"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Update label, sort order, and custom attributes for this lookup item." 
              : "Append a new lookup value to this reference list."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(85vh-5.5rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4">
              <InputField
                id="value_code"
                label="Value Code / Key"
                required
                disabled={isEdit || isSaving}
                error={errors.value_code?.message}
                placeholder="e.g. active"
                {...register("value_code")}
              />

              <InputField
                id="value_label"
                label="Display Value / Label"
                required
                disabled={isSaving}
                error={errors.value_label?.message}
                placeholder="e.g. Active"
                {...register("value_label")}
              />

              <Field>
                <FieldLabel htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </FieldLabel>
                <Textarea
                  id="description"
                  disabled={isSaving}
                  placeholder="Provide details about what this value represents..."
                  className="min-h-[70px] rounded-lg border border-input bg-inherit px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"
                  {...register("description")}
                />
                {errors.description && (
                  <FieldError>{errors.description.message}</FieldError>
                )}
              </Field>

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

              <Field>
                <FieldLabel htmlFor="attributes_raw" className="text-sm font-medium text-foreground">
                  Custom Attributes (JSON format)
                </FieldLabel>
                <Textarea
                  id="attributes_raw"
                  disabled={isSaving}
                  placeholder='e.g. { "currency_symbol": "$", "numeric_code": 840 }'
                  className="min-h-[100px] font-mono text-xs rounded-lg border border-input bg-inherit px-3 py-2 text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"
                  {...register("attributes_raw")}
                />
                {errors.attributes_raw && (
                  <FieldError>{errors.attributes_raw.message}</FieldError>
                )}
              </Field>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-border px-6 py-4 bg-slate-50 flex items-center justify-end gap-2">
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
              {isEdit ? "Save Changes" : "Add Value"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

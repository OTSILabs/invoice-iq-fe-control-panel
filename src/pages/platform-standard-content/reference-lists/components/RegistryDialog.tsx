import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2, ListChecks} from "lucide-react";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {InputField} from "@/components/ui/input-field";
import {Field, FieldLabel, FieldError} from "@/components/ui/field";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";

import {useCreateReferenceRegistry, useUpdateReferenceRegistry} from "@/api/hooks/useReferenceLists";
import type {RegistryDialogProps} from "@/types";
import {referenceRegistrySchema, type ReferenceRegistryFormValues, DEFAULT_REGISTRY_VALUES} from "@/schemas/reference-schema";



export function RegistryDialog({ open, onOpenChange, registry }: RegistryDialogProps) {
  const isEdit = !!registry
  const createMutation = useCreateReferenceRegistry()
  const updateMutation = useUpdateReferenceRegistry()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const { register, handleSubmit, formState: { errors } } = useForm<ReferenceRegistryFormValues>({
    resolver: zodResolver(referenceRegistrySchema) as any,
    defaultValues: registry
      ? {
          registry_key: registry.registry_key,
          display_label: registry.display_label,
          description: registry.description || "",
          source_type: registry.source_type,
          sort_sequence: registry.sort_sequence,
        }
      : DEFAULT_REGISTRY_VALUES
  })


  const onSubmit = async (values: ReferenceRegistryFormValues) => {
    try {
      if (isEdit && registry) {
        await updateMutation.mutateAsync({
          key: registry.registry_key,
          payload: {
            display_label: values.display_label,
            description: values.description,
            source_type: values.source_type,
            sort_sequence: values.sort_sequence,
          }
        })
        toast.success("Reference list updated successfully")
      } else {
        await createMutation.mutateAsync(values)
        toast.success("Reference list created successfully")
      }
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || err.message || "Failed to save reference list")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ListChecks className="size-5 text-primary" />
            {isEdit ? "Edit Reference List" : "Add Reference List"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Update settings and sorting for this reference list registry." 
              : "Create a new platform lookup or reference list registry."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(85vh-5.5rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4">
              <InputField
                id="registry_key"
                label="Registry Key"
                required
                disabled={isEdit || isSaving}
                error={errors.registry_key?.message}
                placeholder="e.g. billing_status"
                {...register("registry_key")}
              />

              <InputField
                id="display_label"
                label="Display Label"
                required
                disabled={isSaving}
                error={errors.display_label?.message}
                placeholder="e.g. Billing Status"
                {...register("display_label")}
              />

              <InputField
                id="source_type"
                label="Source Type"
                required
                disabled={isSaving}
                error={errors.source_type?.message}
                placeholder="e.g. custom"
                {...register("source_type")}
              />

              <Field>
                <FieldLabel htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </FieldLabel>
                <Textarea
                  id="description"
                  disabled={isSaving}
                  placeholder="Describe the purpose of this reference list..."
                  className="min-h-[80px] rounded-lg border border-input bg-inherit px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"
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
              {isEdit ? "Save Changes" : "Create List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

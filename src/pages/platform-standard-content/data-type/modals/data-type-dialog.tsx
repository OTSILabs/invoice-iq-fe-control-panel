import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2, Database} from "lucide-react";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import {InputField} from "@/components/ui/input-field";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  useCreateDataTypeMutation,
  useUpdateDataTypeMutation,
} from "@/api/hooks/data-types"
import {
  createDataTypeSchema,
  type CreateDataTypeFormValues,
  DEFAULT_CREATE_DATA_TYPE_VALUES,
} from "@/schemas/data-type-schema"
import type {DataTypeDialogProps} from "@/types";



export function DataTypeDialog({
  dataType,
  open,
  onOpenChange,
}: DataTypeDialogProps) {
  const isEdit = !!dataType
  const { mutate: createDataType, isPending: isCreating } =
    useCreateDataTypeMutation()
  const { mutate: updateDataType, isPending: isUpdating } =
    useUpdateDataTypeMutation()

  const isPending = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDataTypeFormValues>({
    resolver: zodResolver(createDataTypeSchema),
    defaultValues: dataType
      ? {
          data_type_code: dataType.data_type_code,
          display_label: dataType.display_label,
          description: dataType.description,
          sample_value: dataType.sample_value || "",
          sort_sequence: dataType.sort_sequence ?? 1,
        }
      : DEFAULT_CREATE_DATA_TYPE_VALUES,
  })

  const onSubmit = (data: CreateDataTypeFormValues) => {
    if (isEdit && dataType) {
      updateDataType(
        {
          data_type_code: dataType.data_type_code,
          payload: {
            display_label: data.display_label,
            description: data.description,
            sample_value: data.sample_value,
            sort_sequence: data.sort_sequence,
          },
        },
        {
          onSuccess: () => {
            toast.success(
              `Data type "${data.display_label}" updated successfully!`
            )
            onOpenChange(false)
          },
          onError: (err: unknown) => {
            let errMsg = "Failed to update data type."
            const axiosErr = err as {
              response?: { data?: { message?: unknown } }
            }
            if (axiosErr.response?.data?.message) {
              errMsg = String(axiosErr.response.data.message)
            } else if (err instanceof Error) {
              errMsg = err.message
            }
            toast.error(errMsg)
          },
        }
      )
    } else {
      createDataType(data, {
        onSuccess: () => {
          toast.success(
            `Data type "${data.display_label}" created successfully!`
          )
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          let errMsg = "Failed to create data type."
          const axiosErr = err as {
            response?: { data?: { message?: unknown } }
          }
          if (axiosErr.response?.data?.message) {
            errMsg = String(axiosErr.response.data.message)
          } else if (err instanceof Error) {
            errMsg = err.message
          }
          toast.error(errMsg)
        },
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isPending) {
          onOpenChange(val)
        }
      }}
    >
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Database className="size-5 text-primary" />
            {isEdit ? "Edit Data Type" : "Create Data Type"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the platform standard data type configuration and validation details."
              : "Add a new platform standard data type for validating document and profile fields."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="dialog-form" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="dialog-form-body">
              <InputField
                label={isEdit ? "Data Type Code (Read-only)" : "Data Type Code"}
                placeholder="e.g. email_address"
                disabled={isEdit || isPending}
                error={errors.data_type_code?.message}
                {...register("data_type_code")}
                required
                className={
                  isEdit
                    ? "cursor-not-allowed bg-muted text-muted-foreground opacity-100"
                    : ""
                }
              />

              <InputField
                label="Display Label"
                placeholder="e.g. Email Address"
                error={errors.display_label?.message}
                disabled={isPending}
                {...register("display_label")}
                required
              />

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="e.g. Standard format for electronic mail contact addresses"
                  disabled={isPending}
                  {...register("description")}
                  className="min-h-[80px] text-xs bg-inherit border border-input rounded-lg"
                />
                {errors.description && (
                  <span className="px-1 text-[11px] font-medium text-destructive block">
                    {errors.description.message}
                  </span>
                )}
              </div>

              <InputField
                label="Sample Value"
                placeholder="e.g. test@example.com"
                error={errors.sample_value?.message}
                disabled={isPending}
                {...register("sample_value")}
                required
              />

              <InputField
                label="Sort Sequence"
                type="number"
                placeholder="e.g. 1"
                error={errors.sort_sequence?.message}
                disabled={isPending}
                {...register("sort_sequence", { valueAsNumber: true })}
                required
              />
            </div>
          </ScrollArea>

          {/* Dialog Footer Actions */}
          <DialogFooter className="dialog-form-footer">
            <Button
              type="button"
              variant="outline"
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer text-xs"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer text-xs gap-1.5"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {isEdit ? "Save Changes" : "Create data type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

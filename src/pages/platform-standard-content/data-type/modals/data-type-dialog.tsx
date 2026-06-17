import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
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
import type { DataType } from "@/types"

interface DataTypeDialogProps {
  dataType?: DataType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Data Type" : "Create Data Type"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the platform standard data type configuration and validation details."
              : "Add a new platform standard data type for validating document and profile fields."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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

          <InputField
            label="Description"
            placeholder="e.g. Standard format for electronic mail contact addresses"
            error={errors.description?.message}
            disabled={isPending}
            {...register("description")}
            required
          />

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

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-1.5 text-xs"
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

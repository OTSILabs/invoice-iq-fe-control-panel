import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserCog } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  useUpdatePlatformUserMutation,
  usePlatformRoles,
} from "@/api/hooks/useUsers"
import type { PlatformUser } from "@/types"
import {
  editUserSchema,
  type EditUserFormValues,
} from "@/schemas/user-schema"

const getRolesList = (user: PlatformUser | null | undefined): string[] => {
  if (!user) return []
  if (Array.isArray(user.roles)) {
    return user.roles.flatMap((r: unknown) => {
      const name = typeof r === "string" ? r : (r as { name?: string })?.name || ""
      return name ? [name] : []
    })
  }
  if (Array.isArray(user.role_names)) {
    return user.role_names.flatMap((r: unknown) => {
      const name = typeof r === "string" ? r : (r as { name?: string })?.name || ""
      return name ? [name] : []
    })
  }
  if (typeof user.role === "string" && user.role) {
    return [user.role]
  }
  if (typeof user.role_name === "string" && user.role_name) {
    return [user.role_name]
  }
  return []
}

interface EditUserDialogProps {
  user: PlatformUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const { mutate: updateUser, isPending } = useUpdatePlatformUserMutation()
  const { data: roles = [] } = usePlatformRoles()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      role_name: getRolesList(user)[0] || "",
    },
  })

  const onSubmit = (data: EditUserFormValues) => {
    if (!user) return
    updateUser(
      {
        id: user.id,
        role_names: [data.role_name],
      },
      {
        onSuccess: () => {
          toast.success("User role updated successfully!")
          onOpenChange(false)
          reset()
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { detail?: string } } }
          const detail = error?.response?.data?.detail || "Failed to update user role"
          toast.error(detail)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
       

        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <UserCog className="size-5 text-primary" />
            Edit Role 
          </DialogTitle>
          <DialogDescription>
            Select a role type. Assign the user the appropriate access level.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(85vh-5.5rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4">
              {/* Email (Disabled) */}
              <InputField
                id="email_disabled"
                label="Email"
                value={user?.email || ""}
                disabled
                className="bg-muted text-muted-foreground opacity-100 cursor-not-allowed"
              />

              {/* User Role (Select dropdown) */}
              <InputField
                id="role_name"
                label="Role Type"
                type="select"
                required
                error={errors.role_name?.message}
                {...register("role_name")}
              >
                <option value="" disabled>Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </InputField>
            </div>
          </ScrollArea>

          {/* Dialog Footer Actions */}
          <DialogFooter className="gap-3 border-t border-border bg-popover px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
              onClick={() => {
                onOpenChange(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

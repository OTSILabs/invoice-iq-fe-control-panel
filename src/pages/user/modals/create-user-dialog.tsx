import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCreatePlatformUserMutation } from "@/api/hooks/useUsers"
import type { PlatformRole, CreatePlatformUserPayload } from "@/types"
import {
  createUserSchema,
  type CreateUserFormValues,
  DEFAULT_CREATE_USER_VALUES,
} from "@/schemas/user-schema"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: PlatformRole[]
}

export function CreateUserDialog({ open, onOpenChange, roles }: CreateUserDialogProps) {
  const { mutate: createUser, isPending: isCreating } = useCreatePlatformUserMutation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_CREATE_USER_VALUES,
  })

  const onCreateUserSubmit = (data: CreateUserFormValues) => {
    const payload: CreatePlatformUserPayload = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role_names: [data.role_name],
      status: data.is_active ? "ACTIVE" : "INACTIVE",
    }

    createUser(payload, {
      onSuccess: () => {
        toast.success(`User ${data.full_name} created successfully!`)
        reset()
        onOpenChange(false)
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { detail?: string } } }
        const detail = error?.response?.data?.detail || "Failed to create user"
        toast.error(detail)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
       

        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <UserPlus className="size-5 text-primary" />
            Add User
          </DialogTitle>
          <DialogDescription>
            Create a new user account and assign system access role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onCreateUserSubmit)} className="flex flex-col max-h-[calc(85vh-5.5rem)]" noValidate>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-5 space-y-4">
              {/* Full Name & Email — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="full_name"
                  label="Full Name"
                  required
                  error={errors.full_name?.message}
                  placeholder="e.g. John Doe"
                  {...register("full_name")}
                />

                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  required
                  error={errors.email?.message}
                  placeholder="e.g. john@invoice-iq.com"
                  {...register("email")}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <InputField
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  error={errors.password?.message}
                  placeholder="Minimum 8 characters"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[32px] text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer z-10"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

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

              {/* Is Active Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div>
                  <Label htmlFor="is_active" className="font-medium text-foreground">Is Active</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle user account status</p>
                </div>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  )}
                />
              </div>
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
              disabled={isCreating}
              className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

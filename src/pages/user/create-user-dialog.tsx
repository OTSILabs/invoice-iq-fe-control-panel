import { useState, useEffect } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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

// Zod Validation Schema for creating a user
const createUserSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .regex(/^\S*$/, "Password must not contain spaces"),
  role_name: z.string().min(1, "Access role is required"),
  is_active: z.boolean(),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: PlatformRole[]
}

export function CreateUserDialog({ open, onOpenChange, roles }: CreateUserDialogProps) {
  const { mutate: createUser, isPending: isCreating } = useCreatePlatformUserMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)

  // Reset password visibility when the dialog opens or closes
  if (open !== prevOpen) {
    setPrevOpen(open)
    setShowPassword(false)
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role_name: "",
      is_active: true,
    },
  })

  const watchRoleName = useWatch({ control, name: "role_name" })

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset({
        full_name: "",
        email: "",
        password: "",
        role_name: "",
        is_active: true,
      })
    }
  }, [open, reset])

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
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign system access role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onCreateUserSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              type="text"
              placeholder="e.g. John Doe"
              {...register("full_name")}
              className="bg-background"
            />
            {errors.full_name && (
              <span className="text-xs font-medium text-red-500">
                {errors.full_name.message}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. john@invoice-iq.com"
              {...register("email")}
              className="bg-background"
            />
            {errors.email && (
              <span className="text-xs font-medium text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-foreground">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                {...register("password")}
                className="bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-600 focus:outline-none cursor-pointer z-10"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs font-medium text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* User Role (Select dropdown) */}
          <div className="space-y-1.5">
            <Label className="text-foreground">Role Type <span className="text-destructive">*</span></Label>
            <Select
              value={watchRoleName}
              onValueChange={(val) => setValue("role_name", val, { shouldValidate: true })}
            >
              <SelectTrigger className="bg-background h-10 w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name} className="cursor-pointer">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_name && (
              <span className="text-xs font-medium text-red-500 block mt-1">
                {errors.role_name.message}
              </span>
            )}
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
            <Label htmlFor="is_active" className="text-foreground font-semibold">
              Is Active
            </Label>
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

          {/* Dialog Footer Actions */}
          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4 dark:border-slate-800/80">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onOpenChange(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

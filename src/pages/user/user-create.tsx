import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { useCreatePlatformUserMutation, usePlatformRoles } from "@/api/hooks/useUsers"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { CreatePlatformUserPayload } from "@/types"
import {
  createUserSchema,
  DEFAULT_CREATE_USER_VALUES,
  type CreateUserFormValues,
} from "@/schemas/user-schema"

export function UserCreate() {
  const navigate = useNavigate()
  const { data: roles = [] } = usePlatformRoles()
  const { mutate: createUser, isPending } = useCreatePlatformUserMutation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_CREATE_USER_VALUES,
  })

  const onSubmit = (data: CreateUserFormValues) => {
    const payload: CreatePlatformUserPayload = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role_names: [data.role_name],
      status: data.is_active ? "ACTIVE" : "INACTIVE",
    }

    createUser(payload, {
      onSuccess: (user) => {
        toast.success(`User ${data.full_name} created successfully!`)
        navigate(user?.id ? `/users/${user.id}` : "/users")
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { detail?: string } } }
        toast.error(error?.response?.data?.detail || "Failed to create user")
      },
    })
  }

  return (
    <PageShell>
      <PageHeader
        title="Add User"
        description="Create a new user account and assign system access."
      >
        <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
          <ArrowLeft className="size-4" /> Back to Users
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <UserPlus className="size-4 text-primary" />
            User access
          </span>
        }
        description="Set the user's identity, temporary password, role, and activation status."
        // className="max-w-full"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="dialog-field-grid">
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

          <div className="dialog-field-grid">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password <span className="text-destructive ml-0.1">*</span>
              </Label>
              <div className="relative">
                <InputField
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password?.message && (
                <span className="block px-1 text-[11px] font-medium text-destructive">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role_name" className="text-sm font-medium text-foreground">
                Role Type <span className="text-destructive ml-0.1">*</span>
              </Label>
              <InputField
                id="role_name"
                type="select"
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
          </div>

          <div className="dialog-toggle-row">
            <div>
              <Label htmlFor="is_active" className="font-medium text-foreground">Is Active</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Toggle user account status</p>
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

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={() => navigate("/users")} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create User
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

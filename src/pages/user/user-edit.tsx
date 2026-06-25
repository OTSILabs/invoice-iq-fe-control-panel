import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, UserCog } from "lucide-react"
import { toast } from "sonner"

import { usePlatformRoles, usePlatformUser, useUpdatePlatformUserMutation } from "@/api/hooks/useUsers"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
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
  if (typeof user.role === "string" && user.role) return [user.role]
  if (typeof user.role_name === "string" && user.role_name) return [user.role_name]
  return []
}

export function UserEdit() {
  const { id = "" } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = usePlatformUser(id)
  const { data: roles = [] } = usePlatformRoles()
  const { mutate: updateUser, isPending } = useUpdatePlatformUserMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    values: {
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
          navigate(`/users/${user.id}`)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { detail?: string } } }
          toast.error(error?.response?.data?.detail || "Failed to update user role")
        },
      }
    )
  }

  if (isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isError || !user) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load platform user.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
          Back to Users
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="Edit User"
        description="Update system access role for this user."
      >
        <Button variant="outline" size="sm" onClick={() => navigate(`/users/${user.id}`)}>
          <ArrowLeft className="size-4" /> Back to User
        </Button>
      </PageHeader>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <UserCog className="size-4 text-primary" />
            Role assignment
          </span>
        }
        description="Assign the user the appropriate access level."
      
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <InputField
            id="email_disabled"
            label="Email"
            value={user.email || ""}
            disabled
            className="cursor-not-allowed bg-muted text-muted-foreground opacity-100"
          />

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

          <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
            <Button type="button" variant="outline" onClick={() => navigate(`/users/${user.id}`)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  )
}

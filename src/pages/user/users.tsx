import { useState, useMemo, useEffect } from "react"
import { Plus, Loader2, AlertCircle, RefreshCw, Search, MoreHorizontal, Edit2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useForm, Controller, useWatch } from "react-hook-form"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  usePlatformUsers,
  usePlatformRoles,
  useCreatePlatformUserMutation,
  useUpdatePlatformUserMutation,
} from "@/api/hooks/useUsers"
import type { PlatformUser, PlatformRole, CreatePlatformUserPayload } from "@/types"

const getRolesList = (user: PlatformUser | null | undefined): string[] => {
  if (!user) return []
  if (Array.isArray(user.roles)) {
    return user.roles.map((r: unknown) => (typeof r === "string" ? r : (r as { name?: string })?.name || "")).filter(Boolean)
  }
  if (Array.isArray(user.role_names)) {
    return user.role_names.map((r: unknown) => (typeof r === "string" ? r : (r as { name?: string })?.name || "")).filter(Boolean)
  }
  if (typeof user.role === "string" && user.role) {
    return [user.role]
  }
  if (typeof user.role_name === "string" && user.role_name) {
    return [user.role_name]
  }
  return []
}


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

export function Users() {
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    refetch: refetchUsers,
    isFetching: isFetchingUsers,
  } = usePlatformUsers()

  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
    refetch: refetchRoles,
  } = usePlatformRoles()

  const { mutate: createUser, isPending: isCreating } = useCreatePlatformUserMutation()

  const [searchText, setSearchText] = useState("")
  const [status, setStatus] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleOpenEditDialog = (user: PlatformUser) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  // Create User Form
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

  // Reset form when dialog closes (e.g. via cross button or click outside)
  useEffect(() => {
    if (!isCreateOpen) {
      reset({
        full_name: "",
        email: "",
        password: "",
        role_name: "",
        is_active: true,
      })
    }
  }, [isCreateOpen, reset])

  // Handle User creation
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
        setIsCreateOpen(false)
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { detail?: string } } }
        const detail = error?.response?.data?.detail || "Failed to create user"
        toast.error(detail)
      },
    })
  }

  // Refetch helper
  const handleRefetch = async () => {
    await Promise.all([refetchUsers(), refetchRoles()])
    toast.success("Users refreshed")
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          variant: "outline" as const,
          className: "border-primary text-primary font-semibold",
        }
      case "user":
      case "standard user":
        return {
          variant: "secondary" as const,
          className: "bg-slate-100 text-foreground hover:bg-slate-200 font-semibold",
        }
      default:
        return { variant: "outline" as const, className: "font-semibold" }
    }
  }

  // Column definitions for the Users table
  const columns = useMemo<CustomColumnDef<PlatformUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        width: "28%",
        minWidth: "220px",
        cell: ({ row }) => {
          const initials = row.original.full_name
            ? row.original.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "U"

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 rounded-md border bg-background">
                <AvatarFallback className="rounded-md bg-primary/8 text-[11px] font-semibold text-primary uppercase">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {row.original.full_name}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        width: "30%",
        minWidth: "220px",
        cell: ({ row }) => (
          <span className="block truncate text-sm text-muted-foreground">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "roles",
        header: "Role(s)",
        width: "22%",
        minWidth: "180px",
        cell: ({ row }) => {
          const rolesList = getRolesList(row.original)
          return (
            <div className="flex flex-wrap items-center gap-2">
              {rolesList.map((role, idx) => {
                const badgeProps = getRoleBadgeVariant(role)
                return (
                  <Badge
                    key={idx}
                    variant={badgeProps.variant}
                    className={badgeProps.className}
                  >
                    {String(role).toUpperCase()}
                  </Badge>
                )
              })}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        width: "140px",
        minWidth: "140px",
        rowClassName: "w-40",
        cell: ({ row }) => {
          const statusVal = row.original.status || "ACTIVE"
          return (
            <Badge
              variant="outline"
              className={cn(
                "font-semibold text-xs py-0.5 px-2.5 rounded-full border",
                statusVal === "ACTIVE" && "bg-green-50 border-green-200 text-green-700 dark:bg-emerald-950/20 dark:text-emerald-400",
                statusVal === "INACTIVE" && "bg-slate-100 border-border text-foreground dark:bg-slate-800 dark:text-muted-foreground",
              )}
            >
              {statusVal}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        width: "88px",
        minWidth: "88px",
        cell: ({ row }) => {
          const uiMember = row.original
          return (
            <div className="flex items-center ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-45">
                  <DropdownMenuItem
                    className="text-xs cursor-pointer"
                    onClick={() => handleOpenEditDialog(uiMember)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    Edit Role
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    []
  )

  // Status and search filtering
  const statusAndSearchFilteredUsers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return users.filter((user) => {
      const isActive = user.status === "ACTIVE"

      if (status === "active" && !isActive) return false
      if (status === "inactive" && isActive) return false

      if (!normalizedSearch) return true

      const rolesList = getRolesList(user)
      const roleName = rolesList.join(", ")
      return [user.full_name, user.email, roleName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    })
  }, [users, searchText, status])

  // Final role filtering based on dropdown roleFilter
  const filteredUsers = useMemo(() => {
    return statusAndSearchFilteredUsers.filter((user) => {
      if (roleFilter === "all") return true
      const rolesList = getRolesList(user)
      return rolesList.some((r) => r.toLowerCase() === roleFilter.toLowerCase())
    })
  }, [roleFilter, statusAndSearchFilteredUsers])

  if (isLoadingUsers || isLoadingRoles) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary dark:text-blue-400" />
        <p className="font-medium text-muted-foreground dark:text-muted-foreground">
          Loading platform users...
        </p>
      </div>
    )
  }

  if (isErrorUsers || isErrorRoles) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-950/40">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Failed to load platform data</h2>
          <p className="mt-1 text-muted-foreground dark:text-muted-foreground">
            There was a connection issue. Please check your network and API config.
          </p>
        </div>
        <Button onClick={handleRefetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-white">
            Users
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground dark:text-muted-foreground">
            Manage system access accounts and user permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-50 md:w-60">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-8 bg-background h-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-30 bg-background h-9">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem
                  key={role.id}
                  value={role.name.toLowerCase()}
                  className="cursor-pointer"
                >
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-30 bg-background h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
              <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
              <SelectItem value="inactive" className="cursor-pointer">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefetch}
            className="h-9 w-9 cursor-pointer shrink-0"
          >
            <RefreshCw className={cn("size-4", isFetchingUsers && "animate-spin")} />
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 rounded-xl font-semibold shrink-0"
          >
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Border rounded block matching example card layout */}
      <div className="border rounded-md bg-card">
        <DataTable
          data={filteredUsers}
          columns={columns}
          isLoading={isLoadingUsers || isFetchingUsers}
          enablePagination={false}
          stickyHeader
          fillAvailableHeight
        />
      </div>

      {/* Add User Dialog styled to match */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
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
                  setIsCreateOpen(false)
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

      <EditUserDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        roles={roles}
      />
    </div>
  )
}

// Zod Schema for Edit User Form
const editUserSchema = z.object({
  role_name: z.string().min(1, "Access role is required"),
})

type EditUserFormValues = z.infer<typeof editUserSchema>

interface EditUserDialogProps {
  user: PlatformUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: PlatformRole[]
}

function EditUserDialog({ user, open, onOpenChange, roles }: EditUserDialogProps) {
  const { mutate: updateUser, isPending } = useUpdatePlatformUserMutation()

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      role_name: "",
    },
  })

  const watchRoleName = useWatch({ control, name: "role_name" })

  // Prepopulate form values on open, reset on close (e.g. via cross button or click outside)
  useEffect(() => {
    if (open && user) {
      const rolesList = getRolesList(user)
      const currentRole = rolesList[0] || ""
      reset({
        role_name: currentRole,
      })
    } else if (!open) {
      reset({
        role_name: "",
      })
    }
  }, [user, open, reset])

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
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Edit Role for: {user?.full_name}</DialogTitle>
          <DialogDescription>
            Select a role type. Assign the user the appropriate access level.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email (Disabled) */}
          <div className="space-y-1.5">
            <Label className="text-foreground">Email</Label>
            <Input
              value={user?.email || ""}
              disabled
              className="bg-muted text-muted-foreground opacity-100 cursor-not-allowed"
            />
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

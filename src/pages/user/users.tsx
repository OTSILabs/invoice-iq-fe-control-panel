import { useState, useMemo } from "react"
import { Plus, Loader2, AlertCircle, RefreshCw, MoreHorizontal, Edit2 } from "lucide-react"
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
import { cn, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  usePlatformUsers,
  usePlatformRoles,
} from "@/api/hooks/useUsers"
import type { PlatformUser } from "@/types"
import { CreateUserDialog } from "./create-user-dialog"
import { EditUserDialog } from "./edit-user-dialog"

const getRolesList = (user: PlatformUser | null | undefined): string[] => {
  if (!user) return []
  const raw = Array.isArray(user.roles) ? user.roles 
            : Array.isArray(user.role_names) ? user.role_names 
            : [user.role, user.role_name].filter(Boolean)
  return raw.map((r: any) => typeof r === "string" ? r : r?.name || "").filter(Boolean)
}


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

  const [searchText, setSearchText] = useState("")
  const [status, setStatus] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: users.length }
    roles.forEach((role) => {
      counts[role.name.toLowerCase()] = 0
    })
    users.forEach((user) => {
      const rolesList = getRolesList(user)
      rolesList.forEach((r) => {
        const val = r.toLowerCase()
        counts[val] = (counts[val] || 0) + 1
      })
    })
    return counts
  }, [users, roles])

  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleOpenEditDialog = (user: PlatformUser) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  // Refetch helper
  const handleRefetch = async () => {
    await Promise.all([refetchUsers(), refetchRoles()])
    toast.success("Users refreshed")
  }

  const getRoleBadgeVariant = (role: string) => {
    const r = role?.toLowerCase()
    if (r === "admin") return { variant: "outline" as const, className: "border-primary text-primary font-semibold text-[10px] px-1.5 py-0.5" }
    if (r === "user" || r === "standard user") return { variant: "secondary" as const, className: "bg-slate-100 text-foreground hover:bg-slate-200 font-semibold text-[10px] px-1.5 py-0.5" }
    return { variant: "outline" as const, className: "font-semibold text-[10px] px-1.5 py-0.5" }
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
          const initials = getInitials(row.original.full_name) || "U"

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 rounded-md border bg-background">
                <AvatarFallback className="rounded-md bg-primary/8 text-[11px] font-semibold text-primary uppercase">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
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
          <span className="block truncate text-xs text-muted-foreground">
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
          const isActive = statusVal === "ACTIVE"
          return (
            <Badge
              variant={isActive ? "secondary" : "outline"}
              className={
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "text-muted-foreground"
              }
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

  // Status, Search, and Role combined single-pass filtering
  const filteredUsers = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return users.filter((user) => {
      const isActive = user.status === "ACTIVE"
      if (status === "active" && !isActive) return false
      if (status === "inactive" && isActive) return false

      const rolesList = getRolesList(user)
      if (roleFilter !== "all" && !rolesList.some((r) => r.toLowerCase() === roleFilter.toLowerCase())) return false

      if (!q) return true
      return [user.full_name, user.email, rolesList.join(", ")]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [users, searchText, status, roleFilter])

  if (isLoadingUsers || isLoadingRoles) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary " />
        <p className="font-medium text-muted-foreground ">
          Loading platform users...
        </p>
      </div>
    )
  }

  if (isErrorUsers || isErrorRoles) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-3 ">
          <AlertCircle className="h-8 w-8 text-red-600 " />
        </div>
        <div>
          <h2 className="text-xl font-bold">Failed to load platform data</h2>
          <p className="mt-1 text-muted-foreground ">
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
  
        <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Users</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage system access accounts and user permissions.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-auto font-medium px-3 shadow-none gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

    
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-border p-0">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={roleFilter}
              onValueChange={setRoleFilter}
              className="gap-0"
            >
              <TabsList className="h-9 rounded-md p-0.5">
                <TabsTrigger
                  value="all"
                  className="h-7 cursor-pointer rounded-sm px-2.5 text-xs"
                >
                  All ({roleCounts.all})
                </TabsTrigger>
                {roles.map((role) => {
                  const val = role.name.toLowerCase()
                  return (
                    <TabsTrigger
                      key={role.id}
                      value={val}
                      className="h-7 cursor-pointer rounded-sm px-2.5 text-xs capitalize"
                    >
                      {role.name} ({roleCounts[val] || 0})
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full lg:w-auto">
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search users..."
                className="h-9 w-full sm:w-72"
              />

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-full sm:w-40 bg-background">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all" className="cursor-pointer">
                    All Status
                  </SelectItem>
                  <SelectItem value="active" className="cursor-pointer">
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className="cursor-pointer">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                className="h-9 w-9 cursor-pointer shrink-0 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px"
              >
                <RefreshCw
                  className={cn("size-4", isFetchingUsers && "animate-spin")}
                />
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredUsers}
            columns={columns}
            isLoading={isLoadingUsers || isFetchingUsers}
            enablePagination={true}
            pageSize={10}
            totalItems={filteredUsers.length}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
          />
        </CardContent>
      </Card>

      {/* Add User Dialog styled to match */}
      <CreateUserDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        roles={roles} 
      />

      {/* Edit User Dialog styled to match */}
      <EditUserDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  )
}

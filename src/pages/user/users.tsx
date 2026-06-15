import { useState, useMemo } from "react"
import { Loader2, AlertCircle, RefreshCw, Edit2, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePlatformUsers, usePlatformRoles } from "@/api/hooks/useUsers"
import type { PlatformUser } from "@/types"
import { CreateUserDialog } from "./modals/create-user-dialog"
import { EditUserDialog } from "./modals/edit-user-dialog"
import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/search-input"

const getRolesList = (u: PlatformUser | null | undefined): string[] => {
  if (!u) return []
  const raw = Array.isArray(u.roles) ? u.roles : Array.isArray(u.role_names) ? u.role_names : [u.role, u.role_name]
  return raw.reduce<string[]>((acc, r: unknown) => {
    if (r) {
      const name = typeof r === "string" ? r : (r as { name?: string })?.name || ""
      if (name) acc.push(name)
    }
    return acc
  }, [])
}

const getRoleBadgeVariant = (role: string) => {
  const r = role?.toLowerCase()
  const base = "font-semibold text-[10px] px-1.5 py-0.5"
  if (r === "admin") return { variant: "outline" as const, className: `${base} border-primary text-primary` }
  if (r === "user" || r === "standard user") return { variant: "secondary" as const, className: `${base} bg-slate-100 text-foreground hover:bg-slate-200` }
  return { variant: "outline" as const, className: base }
}

export function Users() {
  const { data: users = [], isLoading: isLoadingUsers, isError: isErrorUsers, refetch: refetchUsers, isFetching: isFetchingUsers } = usePlatformUsers()
  const { data: roles = [], isLoading: isLoadingRoles, isError: isErrorRoles, refetch: refetchRoles } = usePlatformRoles()

  const [searchText, setSearchText] = useState("")
  const [status, setStatus] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null)

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: users.length }
    roles.forEach((r) => { counts[r.name.toLowerCase()] = 0 })
    users.forEach((u) => {
      getRolesList(u).forEach((r) => {
        const val = r.toLowerCase()
        counts[val] = (counts[val] || 0) + 1
      })
    })
    return counts
  }, [users, roles])

  const handleOpenEditDialog = (u: PlatformUser) => {
    setEditingUser(u)
  }

  const handleRefetch = async () => {
    await Promise.all([refetchUsers(), refetchRoles()])
    toast.success("Users refreshed")
  }
  const columns = useMemo<CustomColumnDef<PlatformUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        width: "28%",
        minWidth: "220px",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-md border bg-background">
              <AvatarFallback className="rounded-md bg-primary/8 text-[11px] font-semibold text-primary uppercase">
                {getInitials(row.original.full_name) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{row.original.full_name}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        width: "30%",
        minWidth: "220px",
        cell: ({ row }) => <span className="block truncate text-xs text-muted-foreground">{row.original.email}</span>,
      },
      {
        accessorKey: "roles",
        header: "Role(s)",
        width: "22%",
        minWidth: "180px",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            {getRolesList(row.original).map((role) => {
              const badge = getRoleBadgeVariant(role)
              return (
                <Badge key={role} variant={badge.variant} className={badge.className}>
                  {String(role).toUpperCase()}
                </Badge>
              )
            })}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        width: "140px",
        minWidth: "140px",
        rowClassName: "w-40",
        cell: ({ row }) => {
          const s = row.original.status || "ACTIVE"
          const active = s === "ACTIVE"
          return (
            <Badge
              variant={active ? "secondary" : "outline"}
              className={active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "text-muted-foreground"}
            >
              {s}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        width: "88px",
        minWidth: "88px",
        cell: ({ row }) => (
          <div className="flex items-center ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-45">
                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => handleOpenEditDialog(row.original)}>
                  <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  Edit Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  )
  const filteredUsers = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return users.filter((u) => {
      const active = u.status === "ACTIVE"
      if (status === "active" && !active) return false
      if (status === "inactive" && active) return false

      const rList = getRolesList(u)
      if (roleFilter !== "all" && !rList.some((r) => r.toLowerCase() === roleFilter)) return false

      return !q || [u.full_name, u.email, rList.join(", ")].some((v) => v && String(v).toLowerCase().includes(q))
    })
  }, [users, searchText, status, roleFilter])

  if (isLoadingUsers || isLoadingRoles) return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="font-medium text-muted-foreground">Loading platform users...</p>
    </div>
  )

  if (isErrorUsers || isErrorRoles) return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Failed to load platform data</h2>
        <p className="mt-1 text-muted-foreground">There was a connection issue. Please check your network and API config.</p>
      </div>
      <Button onClick={handleRefetch} variant="outline" className="gap-2" disabled={isFetchingUsers}>
        <RefreshCw className="h-4 w-4" /> Try Again
      </Button>
    </div>
  )

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
      <PageHeader
        title="Users"
        description="Manage system access accounts and user permissions."
      >
        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto font-medium px-3 shadow-none gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
          disabled={isFetchingUsers}
        >
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </PageHeader>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-border p-0">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={roleFilter} onValueChange={setRoleFilter}>
              <TabsList className="h-9 rounded-md p-0.5">
                <TabsTrigger value="all" className="h-7 cursor-pointer rounded-sm px-2.5 text-xs">
                  All ({roleCounts.all})
                </TabsTrigger>
                {roles.map((r) => {
                  const val = r.name.toLowerCase()
                  return (
                    <TabsTrigger key={r.id || val} value={val} className="h-7 cursor-pointer rounded-sm px-2.5 text-xs capitalize">
                      {r.name} ({roleCounts[val] || 0})
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full lg:w-auto">
              <SearchInput value={searchText} onChange={setSearchText} disabled={isFetchingUsers} placeholder="Search users..." className="w-full sm:w-72"/>
              <Select value={status} onValueChange={setStatus} disabled={isFetchingUsers}>
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
                disabled={isFetchingUsers}
              >
                <RefreshCw className={cn("size-4", isFetchingUsers && "animate-spin")} />
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredUsers}
            columns={columns}
            isLoading={isLoadingUsers || isFetchingUsers}
            enablePagination
            pageSize={10}
            totalItems={filteredUsers.length}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
          />
        </CardContent>
      </Card>

      {isCreateOpen && (
        <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} roles={roles} />
      )}
      {editingUser && (
        <EditUserDialog user={editingUser} open={true} onOpenChange={(open) => { if (!open) setEditingUser(null) }} />
      )}
    </div>
  )
}

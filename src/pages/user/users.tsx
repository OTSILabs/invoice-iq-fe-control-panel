import { PageMetadata } from "@/components/layout/PageMetadata"
import { useMemo } from "react"
import type { PlatformUser } from "@/types"
import { useNavigate } from "react-router-dom"
import { Loader2, AlertCircle, RefreshCw, Plus, Users as UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { usePlatformUsers, usePlatformRoles } from "@/api/hooks/useUsers"
import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/ui/search-input"
import { EmptyState, FilterBar, PageShell } from "@/components/invoice-ui/design-system"
import { usePagination } from "@/hooks/use-pagination"
import { getUsersColumns } from "@/config/column-data/columns-data"

export function Users() {
  const navigate = useNavigate()
  const { data: roles = [], isLoading: isLoadingRoles, isError: isErrorRoles, refetch: refetchRoles } = usePlatformRoles()

  const {
    search: searchText,
    setSearch,
    filters,
    setFilters,
    queryParams,
    paginationProps,
  } = usePagination({
    initialFilters: { status: "all", roleFilter: "all" },
  })

  const {
    data: usersResult,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    refetch: refetchUsers,
    isFetching: isFetchingUsers,
  } = usePlatformUsers({
    search: queryParams.search,
    limit: queryParams.limit,
    offset: queryParams.offset,
  })
  const users = usersResult ?? []
  const totalUsers = usersResult?.total ?? 0


  // const roleCounts = useMemo(() => {
  //   const counts: Record<string, number> = { all: users.length }
  //   roles.forEach((r) => { counts[r.name.toLowerCase()] = 0 })
  //   users.forEach((u) => {
  //     getRolesList(u).forEach((r) => {
  //       const val = r.toLowerCase()
  //       counts[val] = (counts[val] || 0) + 1
  //     })
  //   })
  //   return counts
  // }, [users, roles])

  const handleRefetch = async () => {
    await Promise.all([refetchUsers(), refetchRoles()])
    toast.success("Users refreshed")
  }
  const columns = useMemo(() => getUsersColumns(navigate, (user: PlatformUser) => navigate(`/users/${user.id}/edit`)), [navigate])
 

  if (isLoadingUsers || isLoadingRoles) return (
    <PageShell className="min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="font-medium text-muted-foreground">Loading platform users...</p>
    </PageShell>
  )

  if (isErrorUsers || isErrorRoles) return (
    <PageShell className="min-h-[60vh] max-w-md items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Failed to load platform data</h2>
        <p className="mt-1 text-muted-foreground">There was a connection issue. Please check your network and API config.</p>
      </div>
      <Button onClick={handleRefetch} variant="outline" className="gap-2" disabled={isFetchingUsers}>
        <RefreshCw className="h-4 w-4" /> Try Again
      </Button>
    </PageShell>
  )
 

  return (
    <PageShell>
      <PageMetadata title="Users" description="Manage control panel user accounts, roles, access permissions, and profiles." keywords="users, team members, access roles, permissions" />
      <PageHeader
        title="Users"
        description="Manage system access accounts and user permissions."
      >
        <Button
          size="sm"
          onClick={() => navigate("/users/create")}
          className="w-full sm:w-auto font-medium px-3 shadow-none gap-1.5 transition-[transform,background-color] duration-200 hover:-translate-y-0.5 active:translate-y-px"
          disabled={isFetchingUsers}
        >
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </PageHeader>

      <div className="table-container overflow-visible">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar className="relative z-40 overflow-visible p-5 border-b border-border/40">
            <h3 className="text-xs font-semibold  text-muted-foreground">
              User Accounts ({totalUsers})
            </h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full lg:w-auto mt-3 sm:mt-0">
              <SearchInput value={searchText} onChange={setSearch} placeholder="Search users..." className="w-full sm:w-64"/>
              
              <Select
                value={filters.roleFilter}
                onValueChange={(val) => setFilters("roleFilter", val)}
                disabled={isFetchingUsers}
              >
                <SelectTrigger className="h-9 w-full sm:w-44 bg-background/50">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all" className="cursor-pointer text-xs">
                    All Roles 
                  </SelectItem>
                  {roles.map((role) => {
                    const value = role.name.toLowerCase()
                    return (
                      <SelectItem key={value} value={value} className="cursor-pointer text-xs">
                        {role.name} 
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(val) => setFilters("status", val)} disabled={isFetchingUsers}>
                <SelectTrigger className="h-9 w-full sm:w-40 bg-background/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all" className="cursor-pointer text-xs">
                    All Status
                  </SelectItem>
                  <SelectItem value="active" className="cursor-pointer text-xs">
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className="cursor-pointer text-xs">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                className="h-9 w-9  shrink-0"
                disabled={isFetchingUsers}
              >
                <RefreshCw className={cn("size-4", isFetchingUsers && "animate-spin")} />
              </Button>
            </div>
          </FilterBar>

          <DataTable
            data={users}
            columns={columns}
            isLoading={isLoadingUsers || isFetchingUsers}
            {...paginationProps(totalUsers)}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
            onRowClick={(user) => navigate(`/users/${user.id}`)}
            emptyState={
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center animate-in fade-in slide-in-from-bottom-2 transition-[opacity,transform] duration-300">
                <EmptyState
                  icon={UsersIcon}
                  title={searchText || filters.status !== "all" || filters.roleFilter !== "all" ? "No users match filters" : "No platform users"}
                  description={searchText || filters.status !== "all" || filters.roleFilter !== "all" ? "We couldn't find any users matching your search or filters. Try adjusting your search query or filters." : "Add your first platform user to manage system access accounts and user permissions."}
                  className="min-h-0 border-0 bg-transparent py-6"
                  actions={users.length === 0 ? (
                    <Button onClick={() => navigate("/users/create")} size="sm" disabled={isFetchingUsers}>
                      <Plus className="size-3.5" /> Add User
                    </Button>
                  ) : undefined}
                />
              </div>
            }
          />
        </div>
      </div>

    </PageShell>
  )
}
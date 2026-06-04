import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {  Loader2, Info, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { organizationsService } from "@/api/services/organizations.service"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import type { Tenant } from "@/types"

export function OrganizationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: organization, isLoading: isOrgLoading, isError: isOrgError } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationsService.getById(id!),
    enabled: !!id
  })

  const { data: tenants = [], isLoading: isTenantsLoading } = useQuery({
    queryKey: ['organizations', id, 'tenants'],
    queryFn: () => organizationsService.getTenants(id!),
    enabled: !!id
  })

  const columns = useMemo<CustomColumnDef<Tenant>[]>(() => [
    {
      accessorKey: "tenant_admin_full_name",
      header: "Admin Name",
      width: 250,
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {row.original.tenant_admin_full_name || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "tenant_role",
      header: "Role",
      width: 150,
      cell: ({ row }) => (
        <span className="text-slate-500 dark:text-slate-400 capitalize">
          {row.original.tenant_role?.replace('_', ' ') || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "access_status",
      header: "Status",
      width: 120,
      cell: ({ row }) => {
        const isActive = row.original.access_status?.toLowerCase() === 'active';
        return (
          <Badge
            variant={isActive ? "secondary" : "outline"}
            className={
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                : "text-slate-400"
            }
          >
            {row.original.access_status || "Inactive"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      width: 150,
      cell: ({ row }) => (
        <span className="text-xs text-slate-400">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
  ], [])

  if (isOrgLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isOrgError || !organization) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">Failed to load organization data.</p>
        <Button variant="outline" onClick={() => navigate('/organizations')}>
          Back to Organizations
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full pb-8">
      {/* <div className="flex items-center gap-4 pb-2 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/organizations')} className="h-8 w-8 rounded-full border border-slate-200 shadow-sm bg-white hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{organization.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">Tenant: {organization.slug} | Plan: {organization.plan_id || 'None'}</p>
        </div>
      </div> */}

      <div className="bg-white border border-slate-200 rounded-xl p-8  shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Organization Facts</h3>
              <p className="text-[13px] text-slate-500">Key details and configuration for this organization.</p>
            </div>
          </div>
          <Button className="gap-1.5 rounded-xl font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" /> Add Tenant
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6 pt-2">
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Organization ID:</span>
            <span className="font-semibold text-slate-900">{organization.id}</span>
          </span>
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Name:</span>
            <span className="font-semibold text-slate-900">{organization.name}</span>
          </span>
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Tenant Count:</span>
            <span className="font-semibold text-slate-900">{organization.tenant_count?.toString() || '0'}</span>
          </span>
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Status:</span>
            <span className="font-semibold text-slate-900">{organization.status || 'Active'}</span>
          </span>
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Created At:</span>
            <span className="font-semibold text-slate-900">
              {organization.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Attached Tenants</h3>
            <p className="text-[13px] text-slate-500">List of tenants associated with this organization.</p>
          </div>
        </div>
        
        <div className="relative">
          <DataTable
            data={tenants}
            columns={columns}
            isLoading={isTenantsLoading}
            enablePagination={true}
            pageSize={5}
            totalItems={tenants.length}
            stickyHeader
            tableContainerClassName="border-0 rounded-none bg-transparent"
            emptyState={
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="mx-auto max-w-md space-y-4">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    No Tenants Found
                  </h3>
                  <p className="text-sm text-slate-500">
                    There are no tenants currently attached to this organization.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
}

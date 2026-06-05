import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Users, Plus, MoreVertical, Eye, Trash2, Ban, CheckCircle2, Lock, Unlock, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { organizationsService } from "@/api/services/organizations.service"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import type { Tenant } from "@/types"
import { CreateOrganizationModal } from "@/components/modals/create-organization-modal"

import { ActivateTenantDialog } from "@/components/tenant-actions/activate-tenant-dialog"
import { DeactivateTenantDialog } from "@/components/tenant-actions/deactivate-tenant-dialog"
import { BlockTenantDialog } from "@/components/tenant-actions/block-tenant-dialog"
import { UnblockTenantDialog } from "@/components/tenant-actions/unblock-tenant-dialog"
import { ExpireTenantDialog } from "@/components/tenant-actions/expire-tenant-dialog"
import { DeleteTenantDialog } from "@/components/tenant-actions/delete-tenant-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface OrganizationTenantsTabProps {
  orgId: string;
  organizationName: string;
}

export function OrganizationTenantsTab({ orgId, organizationName }: OrganizationTenantsTabProps) {
  const navigate = useNavigate()
  
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null)
  const [tenantToDeactivate, setTenantToDeactivate] = useState<Tenant | null>(null)
  const [tenantToActivate, setTenantToActivate] = useState<Tenant | null>(null)
  const [tenantToBlock, setTenantToBlock] = useState<Tenant | null>(null)
  const [tenantToUnblock, setTenantToUnblock] = useState<Tenant | null>(null)
  const [tenantToExpire, setTenantToExpire] = useState<Tenant | null>(null)

  const { data: tenants = [], isLoading: isTenantsLoading } = useQuery({
    queryKey: ['organizations', orgId, 'tenants'],
    queryFn: () => organizationsService.getTenants(orgId),
    enabled: !!orgId
  })

  const columns = useMemo<CustomColumnDef<Tenant>[]>(() => [
    {
      accessorKey: "tenant_admin_full_name",
      header: "Admin Name",
      width: 250,
      cell: ({ row }) => (
        <span className="font-semibold text-foreground dark:text-slate-200">
          {row.original.tenant_admin_full_name || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "tenant_role",
      header: "Role",
      width: 150,
      cell: ({ row }) => (
        <span className="text-muted-foreground dark:text-muted-foreground capitalize">
          {String(row.original.tenant_role || "").replace('_', ' ') || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "access_status",
      header: "Status",
      width: 120,
      cell: ({ row }) => {
        const isActive = String(row.original.access_status || "").toLowerCase() === 'active';
        return (
          <Badge
            variant={isActive ? "secondary" : "outline"}
            className={
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                : "text-muted-foreground"
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
        <span className="text-xs text-muted-foreground">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      width: 80,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => navigate(`/organizations/${orgId}/tenants/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4 text-primary" />
              <span>View Details</span>
            </DropdownMenuItem>
            {String(row.original.access_status || "").toLowerCase() !== 'deactivated' ? (
              <DropdownMenuItem 
                onClick={() => setTenantToDeactivate(row.original)}
                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 cursor-pointer"
              >
                <Ban className="mr-2 h-4 w-4" />
                <span>Deactivate</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => setTenantToActivate(row.original)}
                className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 cursor-pointer"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Activate</span>
              </DropdownMenuItem>
            )}
            {String(row.original.access_status || "").toLowerCase() !== 'blocked' ? (
              <DropdownMenuItem 
                onClick={() => setTenantToBlock(row.original)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <Lock className="mr-2 h-4 w-4" />
                <span>Block</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => setTenantToUnblock(row.original)}
                className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 cursor-pointer"
              >
                <Unlock className="mr-2 h-4 w-4" />
                <span>Unblock</span>
              </DropdownMenuItem>
            )}
            
            {String(row.original.access_status || "").toLowerCase() !== 'expired' && (
              <DropdownMenuItem 
                onClick={() => setTenantToExpire(row.original)}
                className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 cursor-pointer"
              >
                <Clock className="mr-2 h-4 w-4" />
                <span>Expire</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setTenantToDelete(row.original)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [orgId, navigate])

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Attached Tenants</h3>
            <p className="text-[13px] text-muted-foreground">List of tenants associated with this organization.</p>
          </div>
        </div>

        <CreateOrganizationModal existingOrganization={{ id: orgId, name: organizationName }}>
          <Button className="gap-1.5 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4" /> Add Tenant
          </Button>
        </CreateOrganizationModal>
      </div>
      
      <div className="relative">
        <DataTable
          data={Array.isArray(tenants) ? tenants : []}
          columns={columns}
          isLoading={isTenantsLoading}
          enablePagination={true}
          pageSize={5}
          totalItems={Array.isArray(tenants) ? tenants.length : 0}
          stickyHeader
          tableContainerClassName="border-0 rounded-none bg-transparent"
          emptyState={
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="mx-auto max-w-md space-y-4">
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  No Tenants Found
                </h3>
                <p className="text-sm text-muted-foreground">
                  There are no tenants currently attached to this organization.
                </p>
              </div>
            </div>
          }
        />
      </div>

      <ActivateTenantDialog tenant={tenantToActivate} onClose={() => setTenantToActivate(null)} orgId={orgId} />
      <DeactivateTenantDialog tenant={tenantToDeactivate} onClose={() => setTenantToDeactivate(null)} orgId={orgId} />
      <BlockTenantDialog tenant={tenantToBlock} onClose={() => setTenantToBlock(null)} orgId={orgId} />
      <UnblockTenantDialog tenant={tenantToUnblock} onClose={() => setTenantToUnblock(null)} orgId={orgId} />
      <ExpireTenantDialog tenant={tenantToExpire} onClose={() => setTenantToExpire(null)} orgId={orgId} />
      <DeleteTenantDialog tenant={tenantToDelete} onClose={() => setTenantToDelete(null)} orgId={orgId} />
    </div>
  )
}

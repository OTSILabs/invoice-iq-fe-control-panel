import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Info, Users, Plus, MoreHorizontal, MoreVertical, Eye, Edit, Trash2, Ban, CheckCircle2, Lock, Unlock, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { organizationsService } from "@/api/services/organizations.service"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import type { Tenant } from "@/types"
import { CreateOrganizationModal } from "@/components/create-organization-modal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ConfigurationsTable } from "@/components/configurations-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function OrganizationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null)
  const [tenantToDeactivate, setTenantToDeactivate] = useState<Tenant | null>(null)
  const [tenantToActivate, setTenantToActivate] = useState<Tenant | null>(null)
  const [tenantToBlock, setTenantToBlock] = useState<Tenant | null>(null)
  const [tenantToUnblock, setTenantToUnblock] = useState<Tenant | null>(null)
  const [tenantToExpire, setTenantToExpire] = useState<Tenant | null>(null)
  const [governanceReason, setGovernanceReason] = useState("")
  const [isDeactivateChecked, setIsDeactivateChecked] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.deleteTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id, 'tenants'] })
      toast.success("Tenant deleted successfully")
      setTenantToDelete(null)
      setIsDeactivateChecked(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete tenant")
      console.error("Delete tenant failed:", error)
    }
  })

  const deactivateMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.deactivateTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id, 'tenants'] })
      toast.success("Tenant deactivated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to deactivate tenant")
      console.error("Deactivate tenant failed:", error)
    }
  })

  const activateMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.activateTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id, 'tenants'] })
      toast.success("Tenant activated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to activate tenant")
      console.error("Activate tenant failed:", error)
    }
  })

  const blockMutation = useMutation({
    mutationFn: (data: { tenantId: string, outcome: string }) => organizationsService.blockTenant(data.tenantId, data.outcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id, 'tenants'] })
      toast.success("Tenant blocked successfully")
      setTenantToBlock(null)
      setGovernanceReason("")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to block tenant")
      console.error("Block tenant failed:", error)
    }
  })

  const unblockMutation = useMutation({
    mutationFn: (data: { tenantId: string, outcome: string }) => organizationsService.unblockTenant(data.tenantId, data.outcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id, 'tenants'] })
      toast.success("Tenant unblocked successfully")
      setTenantToUnblock(null)
      setGovernanceReason("")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unblock tenant")
      console.error("Unblock tenant failed:", error)
    }
  })

  const expireMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.expireTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id, 'tenants'] })
      toast.success("Tenant expired successfully")
      setTenantToExpire(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to expire tenant")
      console.error("Expire tenant failed:", error)
    }
  })

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;
    
    const isCurrentlyDeactivated = String(tenantToDelete.access_status || "").toLowerCase() === 'deactivated';
    
    if (!isCurrentlyDeactivated) {
      if (!isDeactivateChecked) {
        toast.error("You must check the deactivation confirmation box before deleting.");
        return;
      }
      try {
        await deactivateMutation.mutateAsync(tenantToDelete.id);
      } catch (error) {
        return; // Deactivation failed, stop deletion process
      }
    }
    
    deleteMutation.mutate(tenantToDelete.id);
  }

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
    {
      id: "actions",
      header: "Actions",
      width: 80,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => navigate(`/organizations/${id}/tenants/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4 text-blue-600" />
              <span>View Details</span>
            </DropdownMenuItem>
            {String(row.original.access_status || "").toLowerCase() !== 'deactivated' ? (
              <DropdownMenuItem 
                onClick={() => {
                  setTenantToDeactivate(row.original)
                }}
                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 cursor-pointer"
              >
                <Ban className="mr-2 h-4 w-4" />
                <span>Deactivate</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => {
                  setTenantToActivate(row.original)
                }}
                className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 cursor-pointer"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Activate</span>
              </DropdownMenuItem>
            )}
            {String(row.original.access_status || "").toLowerCase() !== 'blocked' ? (
              <DropdownMenuItem 
                onClick={() => {
                  setTenantToBlock(row.original)
                  setGovernanceReason("")
                }}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <Lock className="mr-2 h-4 w-4" />
                <span>Block</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => {
                  setTenantToUnblock(row.original)
                  setGovernanceReason("")
                }}
                className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 cursor-pointer"
              >
                <Unlock className="mr-2 h-4 w-4" />
                <span>Unblock</span>
              </DropdownMenuItem>
            )}
            
            {String(row.original.access_status || "").toLowerCase() !== 'expired' && (
              <DropdownMenuItem 
                onClick={() => {
                  setTenantToExpire(row.original)
                }}
                className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 cursor-pointer"
              >
                <Clock className="mr-2 h-4 w-4" />
                <span>Expire</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                setTenantToDelete(row.original);
                setIsDeactivateChecked(false);
              }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [id, navigate, deleteMutation.mutate, deactivateMutation.mutate, activateMutation.mutate, blockMutation.mutate, unblockMutation.mutate, expireMutation.mutate])

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
     <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      {/* <div className="flex items-center gap-4 pb-2 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/organizations')} className="h-8 w-8 rounded-full border border-slate-200 shadow-sm bg-white hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{organization.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">Tenant: {organization.slug} | Plan: {organization.plan_id || 'None'}</p>
        </div>
      </div> */}

      <div className="bg-white border border-slate-200 rounded-xl p-8 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Organization Facts</h3>
              <p className="text-[13px] text-slate-500">Key details and configuration for this organization.</p>
            </div>
          </div>
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

      <Tabs defaultValue="configuration" className="w-full mt-2">
        <TabsList className="mb-6 grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="m-0 animate-in fade-in-50 duration-300">
          <ConfigurationsTable entityId={organization.id} entityType="organization" />
        </TabsContent>

        <TabsContent value="tenants" className="m-0 animate-in fade-in-50 duration-300">
          <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Attached Tenants</h3>
                  <p className="text-[13px] text-slate-500">List of tenants associated with this organization.</p>
                </div>
              </div>

              <CreateOrganizationModal existingOrganization={{ id: organization.id, name: organization.name }}>
                <Button className="gap-1.5 rounded-xl font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
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
        </TabsContent>
      </Tabs>

      <Dialog open={!!tenantToDeactivate} onOpenChange={(open) => {
        if (!open) setTenantToDeactivate(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate the tenant <strong>{tenantToDeactivate?.tenant_admin_full_name || tenantToDeactivate?.id}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Deactivating this tenant will immediately revoke its access. The tenant will remain in the system but will no longer be active.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantToDeactivate(null)} disabled={deactivateMutation.isPending}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              onClick={() => {
                if (tenantToDeactivate) {
                  deactivateMutation.mutate(tenantToDeactivate.id, {
                    onSuccess: () => setTenantToDeactivate(null)
                  })
                }
              }}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tenantToActivate} onOpenChange={(open) => {
        if (!open) setTenantToActivate(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to activate the tenant <strong>{tenantToActivate?.tenant_admin_full_name || tenantToActivate?.id}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Activating this tenant will restore their access to the system immediately.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantToActivate(null)} disabled={activateMutation.isPending}>
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={() => {
                if (tenantToActivate) {
                  activateMutation.mutate(tenantToActivate.id, {
                    onSuccess: () => setTenantToActivate(null)
                  })
                }
              }}
              disabled={activateMutation.isPending}
            >
              {activateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tenantToBlock} onOpenChange={(open) => {
        if (!open) {
          setTenantToBlock(null);
          setGovernanceReason("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Tenant</DialogTitle>
            <DialogDescription>
              You are about to block the tenant <strong>{tenantToBlock?.tenant_admin_full_name || tenantToBlock?.id}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-600">
              Blocking this tenant will strictly prevent them from interacting with the platform. You must provide a reason for this governance action.
            </p>
            <div className="space-y-2">
              <Label htmlFor="block-reason">Reason for blocking <span className="text-red-500">*</span></Label>
              <Input 
                id="block-reason"
                placeholder="Enter outcome/reason" 
                value={governanceReason}
                onChange={(e) => setGovernanceReason(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTenantToBlock(null);
              setGovernanceReason("");
            }} disabled={blockMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (tenantToBlock && governanceReason.trim()) {
                  blockMutation.mutate({ tenantId: tenantToBlock.id, outcome: governanceReason.trim() })
                }
              }}
              disabled={blockMutation.isPending || !governanceReason.trim()}
            >
              {blockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Block Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tenantToUnblock} onOpenChange={(open) => {
        if (!open) {
          setTenantToUnblock(null);
          setGovernanceReason("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock Tenant</DialogTitle>
            <DialogDescription>
              You are about to unblock the tenant <strong>{tenantToUnblock?.tenant_admin_full_name || tenantToUnblock?.id}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-600">
              Unblocking this tenant will restore their ability to interact with the platform. You must provide a reason for this governance action.
            </p>
            <div className="space-y-2">
              <Label htmlFor="unblock-reason">Reason for unblocking <span className="text-red-500">*</span></Label>
              <Input 
                id="unblock-reason"
                placeholder="Enter outcome/reason" 
                value={governanceReason}
                onChange={(e) => setGovernanceReason(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTenantToUnblock(null);
              setGovernanceReason("");
            }} disabled={unblockMutation.isPending}>
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={() => {
                if (tenantToUnblock && governanceReason.trim()) {
                  unblockMutation.mutate({ tenantId: tenantToUnblock.id, outcome: governanceReason.trim() })
                }
              }}
              disabled={unblockMutation.isPending || !governanceReason.trim()}
            >
              {unblockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unblock Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tenantToExpire} onOpenChange={(open) => {
        if (!open) setTenantToExpire(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expire Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to expire the tenant <strong>{tenantToExpire?.tenant_admin_full_name || tenantToExpire?.id}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Expiring this tenant will immediately mark their plan or subscription as expired, terminating their active usage rights.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantToExpire(null)} disabled={expireMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
              onClick={() => {
                if (tenantToExpire) {
                  expireMutation.mutate(tenantToExpire.id, {
                    onSuccess: () => setTenantToExpire(null)
                  })
                }
              }}
              disabled={expireMutation.isPending}
            >
              {expireMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Expire Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!tenantToDelete} onOpenChange={(open) => {
        if (!open) {
          setTenantToDelete(null);
          setIsDeactivateChecked(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              You are about to delete the tenant <strong>{tenantToDelete?.tenant_admin_full_name || tenantToDelete?.id}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {tenantToDelete && String(tenantToDelete.access_status || "").toLowerCase() !== 'deactivated' ? (
              <>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 text-sm mb-4">
                  This tenant is currently active. You must deactivate the account before it can be deleted.
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="deactivate-confirm" 
                    checked={isDeactivateChecked} 
                    onCheckedChange={(checked) => setIsDeactivateChecked(checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="deactivate-confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I understand and confirm deactivation
                    </Label>
                    <p className="text-xs text-slate-500">
                      By checking this, the tenant will be deactivated and then permanently deleted.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600">This action cannot be undone. This will permanently delete the tenant and remove their data from our servers.</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTenantToDelete(null);
              setIsDeactivateChecked(false);
            }} disabled={deleteMutation.isPending || deactivateMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={
                deleteMutation.isPending || 
                deactivateMutation.isPending || 
                (!!tenantToDelete && String(tenantToDelete.access_status || "").toLowerCase() !== 'deactivated' && !isDeactivateChecked)
              }
            >
              {(deleteMutation.isPending || deactivateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tenantToDelete && String(tenantToDelete.access_status || "").toLowerCase() !== 'deactivated' ? "Deactivate & Delete" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

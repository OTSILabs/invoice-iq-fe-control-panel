import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfigurationsTable } from "@/components/configurations-table"
import { organizationsService } from "@/api/services/organizations.service"

export function TenantDetail() {
  const { orgId, tenantId } = useParams<{ orgId: string; tenantId: string }>()
  const navigate = useNavigate()

  const { data: organization } = useQuery({
    queryKey: ['organizations', orgId],
    queryFn: () => organizationsService.getById(orgId!),
    enabled: !!orgId
  })

  // In a real app, you might have a getTenantById endpoint.
  // For now, we'll fetch all tenants and find the one that matches.
  const { data: tenants = [], isLoading, isError } = useQuery({
    queryKey: ['organizations', orgId, 'tenants'],
    queryFn: () => organizationsService.getTenants(orgId!),
    enabled: !!orgId
  })

  const tenant = tenants.find((t) => t.id === tenantId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError || !tenant) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">Failed to load tenant data or tenant not found.</p>
        <Button variant="outline" onClick={() => navigate(`/organizations/${orgId}`)}>
          Back to Organization
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Tenant Facts</h3>
              <p className="text-[13px] text-slate-500">Key details for this tenant.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(`/organizations/${orgId}`)} className="text-sm shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organization
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6 pt-2">
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Tenant ID:</span>
            <span className="font-semibold text-slate-900">{tenant.id}</span>
          </span>
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Admin Name:</span>
            <span className="font-semibold text-slate-900">{tenant.tenant_admin_full_name}</span>
          </span>
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Role:</span>
            <span className="font-semibold text-slate-900 capitalize">{tenant.tenant_role?.replace('_', ' ')}</span>
          </span>
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Status:</span>
            <Badge
              variant={tenant.access_status?.toLowerCase() === 'active' ? "secondary" : "outline"}
              className={
                tenant.access_status?.toLowerCase() === 'active'
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "text-slate-400"
              }
            >
              {tenant.access_status || "Inactive"}
            </Badge>
          </span>
          <span className="text-sm flex items-center gap-2">
            <span className="font-medium text-slate-500">Created At:</span>
            <span className="font-semibold text-slate-900">
              {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </span>
        </div>
      </div>

      <ConfigurationsTable entityId={tenant.id} entityType="tenant" />
    </div>
  )
}

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { organizationsService } from "@/api/services/organizations.service"

import { TenantActionDialog } from "@/pages/tenants/tenant-actions/tenant-action-dialog"
import { AssignPlanDialog } from "@/pages/tenants/tenant-actions/assign-plan-dialog"
import type { Tenant } from "@/types"

import { TenantDetailHeader } from "./components/tenant-detail-header"
import { TenantOverviewCard } from "./components/tenant-overview-card"
import { TenantTabs } from "./components/tenant-tabs"

export function TenantDetail() {
  const { orgId, tenantId } = useParams<{ orgId: string; tenantId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [tenantAction, setTenantAction] = useState<{
    type: "activate" | "deactivate" | "block" | "unblock" | "expire" | "delete" | "assignPlan"
    tenant: Tenant
  } | null>(null)

  const { data: tenants = [], isLoading, isError } = useQuery({
    queryKey: ['organizations', orgId, 'tenants'],
    queryFn: () => organizationsService.getTenants(orgId!),
    enabled: !!orgId
  })

  const tenant = tenants.find((t) => t.id === tenantId)

  const retryMutation = useMutation({
    mutationFn: () => organizationsService.retryProvisioning(tenantId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'tenants'] });
      toast.success("Provisioning retry initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to retry provisioning");
    }
  });

  const migrateMutation = useMutation({
    mutationFn: () => organizationsService.migrateTenant(tenantId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'tenants'] });
      toast.success("Tenant migration initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate migration");
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !tenant) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Failed to load tenant data or tenant not found.</p>
        <Button variant="outline" onClick={() => navigate(`/organizations/${orgId}`)}>
          Back to Organization
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Action Header ── */}
      <TenantDetailHeader
        tenant={tenant}
        orgId={orgId!}
        onAction={setTenantAction}
        onRetry={() => retryMutation.mutate()}
        isPendingRetry={retryMutation.isPending}
        onMigrate={() => migrateMutation.mutate()}
        isPendingMigrate={migrateMutation.isPending}
      />

      {/* ── Details Card ── */}
      <TenantOverviewCard tenant={tenant} orgId={orgId!} />

      {/* ── Tabs Content (Profile, Configurations, Database, Events) ── */}
      <TenantTabs
        tenant={tenant}
        onAction={setTenantAction}
        onRetry={() => retryMutation.mutate()}
        isPendingRetry={retryMutation.isPending}
        onMigrate={() => migrateMutation.mutate()}
        isPendingMigrate={migrateMutation.isPending}
      />

      <TenantActionDialog 
        action={tenantAction && tenantAction.type !== "assignPlan" ? (tenantAction as any) : null} 
        onClose={() => setTenantAction(null)} 
        orgId={orgId} 
        onSuccess={() => {
          if (tenantAction?.type === "delete") {
            navigate(`/organizations/${orgId}`)
          }
        }} 
      />
      <AssignPlanDialog 
        tenant={tenantAction?.type === "assignPlan" ? tenantAction.tenant : null} 
        onClose={() => setTenantAction(null)} 
        orgId={orgId} 
      />

    </div>
  )
}

export default TenantDetail;

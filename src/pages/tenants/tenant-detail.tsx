import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { organizationsService } from "@/api/services/organizations.service"
import { useTenantDetailById } from "@/api/hooks/useOrganizations"

import { TenantActionDialog } from "@/pages/tenants/tenant-actions/tenant-action-dialog"
import { AssignPlanDialog } from "@/pages/tenants/tenant-actions/assign-plan-dialog"
import type { Tenant } from "@/types"

import { TenantDetailHeader } from "./components/tenant-detail-header"
import { TenantOverviewCard } from "./components/tenant-overview-card"
import { TenantTabs } from "./components/tenant-tabs"
import { PageShell } from "@/components/invoice-ui/design-system"

export function TenantDetail() {
  const { orgId, tenantId } = useParams<{ orgId?: string; tenantId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [tenantAction, setTenantAction] = useState<{
    type: "activate" | "deactivate" | "block" | "unblock" | "expire" | "delete" | "assignPlan"
    tenant: Tenant
  } | null>(null)

  // Fetch tenant details by slug or ID directly using the backend API
  const { data: tenant, isLoading, isError } = useTenantDetailById(tenantId)

  const activeOrgId = orgId || tenant?.organisation_id || ""

  const retryMutation = useMutation({
    mutationFn: () => organizationsService.retryProvisioning(tenant?.id || tenantId || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', activeOrgId, 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenants', tenantId] });
      toast.success("Provisioning retry initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to retry provisioning");
    }
  });

  const migrateMutation = useMutation({
    mutationFn: () => organizationsService.migrateTenant(tenant?.id || tenantId || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', activeOrgId, 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenants', tenantId] });
      toast.success("Tenant migration initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate migration");
    }
  });

  if (isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (isError || !tenant) {
    const isFromTenantsTab = window.location.pathname.startsWith("/tenants")
    const backUrl = isFromTenantsTab ? "/tenants" : `/organizations/${activeOrgId || 'list'}`
    const backLabel = isFromTenantsTab ? "Back to Tenants" : "Back to Organization"

    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load tenant data or tenant not found.</p>
        <Button variant="outline" onClick={() => navigate(backUrl)}>
          {backLabel}
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      
      {/* ── Action Header ── */}
      <TenantDetailHeader
        tenant={tenant}
        orgId={activeOrgId}
        onAction={setTenantAction}
        onRetry={() => retryMutation.mutate()}
        isPendingRetry={retryMutation.isPending}
        onMigrate={() => migrateMutation.mutate()}
        isPendingMigrate={migrateMutation.isPending}
      />

      {/* ── Details Card ── */}
      <TenantOverviewCard tenant={tenant} orgId={activeOrgId} />

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
        orgId={activeOrgId} 
        onSuccess={() => {
          if (tenantAction?.type === "delete") {
            const isFromTenantsTab = window.location.pathname.startsWith("/tenants")
            navigate(isFromTenantsTab ? "/tenants" : `/organizations/${activeOrgId}`)
          }
        }} 
      />
      {tenantAction?.type === "assignPlan" && (
        <AssignPlanDialog 
          tenant={tenantAction.tenant} 
          onClose={() => setTenantAction(null)} 
          orgId={activeOrgId} 
        />
      )}

    </PageShell>
  )
}

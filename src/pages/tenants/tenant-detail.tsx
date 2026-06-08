import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfigurationsTable } from "@/pages/organization/configurations-table"
import { TenantEventsTable } from "@/pages/tenants/tenant-events-table"
import { organizationsService } from "@/api/services/organizations.service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function TenantDetail() {
  const { orgId, tenantId } = useParams<{ orgId: string; tenantId: string }>()
  const navigate = useNavigate()
  const { data: tenants = [], isLoading, isError } = useQuery({
    queryKey: ['organizations', orgId, 'tenants'],
    queryFn: () => organizationsService.getTenants(orgId!),
    enabled: !!orgId
  })

  const tenant = tenants.find((t) => t.id === tenantId)

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

  const initials = (tenant.id || "TN")
    .slice(0, 2)
    .toUpperCase()

  const facts = [
    { label: "Tenant ID", value: tenant.id },
    { label: "Admin Name", value: tenant.tenant_admin_full_name },
    { label: "Role", value: tenant.tenant_role?.replace('_', ' ') },
    { label: "Created At", value: tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A' },
  ]

  return (
    <div className="grid w-full animate-in grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr] gap-6 pb-12 items-start duration-300 fade-in">
      {/* ── Sidebar ── */}
   <aside className="flex flex-col gap-3">
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="bg-card rounded-xl p-5 shrink-0 font-sans">

      {/* Header — matches OrganizationFacts */}
      <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-medium text-sm">
            {initials}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground">{tenant.tenant_admin_full_name || tenant.id}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{tenant.id}</p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit text-[10px] px-2 py-0.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {tenant.access_status || "Active"}
        </Badge>
      </div>

      {/* Facts */}
      <div className="flex flex-col gap-y-4">
        {facts.map((fact, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">{fact.label}</span>
            <span className={`text-xs font-semibold text-foreground capitalize truncate`} title={fact.value}>
              {fact.value || "N/A"}
            </span>
          </div>
        ))}
      </div>

    </div>
  </div>

  <Button
    variant="outline"
    size="sm"
    className="w-full justify-start text-xs text-muted-foreground shadow-none"
    onClick={() => navigate(`/organizations/${orgId}`)}
  >
    <ArrowLeft className="mr-2 h-3.5 w-3.5" />
    Back to Organization
  </Button>
</aside>

      <div className="w-full min-w-0">
        <Tabs defaultValue="configuration" className="w-full">
        <TabsList variant="line" className="mb-6 justify-start gap-6 [&>button]:flex-none">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="m-0 animate-in fade-in-50 duration-300">
          <ConfigurationsTable entityId={tenant.id} entityType="tenant" />
        </TabsContent>

        <TabsContent value="events" className="m-0 animate-in fade-in-50 duration-300">
          <TenantEventsTable tenantId={tenant.id} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

import { useParams, useNavigate } from "react-router-dom"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { useOrganizationDetail, useOrganizationTenants } from "@/api/hooks/useOrganizations"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ConfigurationsTable } from "@/pages/organization/components/configurations-table"
import { OrganizationTenantsTab } from "@/pages/organization/components/organization-tenants-tab"


const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}

export function OrganizationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: organization, isLoading, isError } = useOrganizationDetail(id)
  const { data: tenants = [] } = useOrganizationTenants(id)

  if (isError || (!isLoading && !organization)) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Failed to load organization data.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/organizations")}>
          Back to organizations
        </Button>
      </div>
    )
  }

  if (isLoading || !organization) return null

  const onboardingCfg = {
    complete: { label: "Complete", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900" },
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900" },
    in_progress: { label: "In progress", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900" },
  }[organization.onboarding_status?.toLowerCase() || "complete"] || { label: "Complete", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400" }

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Organization Details</h1>
          <p className="text-xs text-muted-foreground">View and manage organization, tenants and configurations</p>
        </div>
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border shadow-sm cursor-pointer" onClick={() => navigate("/organizations")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Details Card */}
      <div className="w-full">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />
          
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold uppercase">
                {getInitials(organization.name || "OR")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate" title={organization.name}>{organization.name}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{organization.id}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
            {[
              { label: "Onboarding", content: <Badge variant="outline" className={`text-xxs px-2 py-0.5 font-medium border w-fit ${onboardingCfg.className}`}>{onboardingCfg.label}</Badge> },
              { label: "Tenants", content: <p className="text-sm font-semibold text-foreground">{organization.tenant_count ?? tenants.length}</p> },
              { label: "Slug / Domain", content: <p className="text-xs font-bold text-foreground truncate" title={organization.slug}>{organization.slug || "—"}</p> },
              { label: "Created At", content: <p className="text-xs font-semibold text-foreground">{formatDate(organization.created_at)}</p> },
              { label: "Updated At", content: <p className="text-xs font-semibold text-foreground">{formatDate(organization.updated_at)}</p> },
              { label: "Organization ID", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={organization.id}>{organization.id}</p> }
            ].map((item) => (
              <div key={item.label} className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                {item.content}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tenants" className="w-full">
        <TabsList variant="line" className="mb-4 h-9 justify-start gap-6 [&>button]:flex-none border-b border-border w-full">
          <TabsTrigger value="tenants" className="cursor-pointer">Tenants</TabsTrigger>
          <TabsTrigger value="configuration" className="cursor-pointer">Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="m-0 animate-in fade-in duration-300">
          <OrganizationTenantsTab orgId={organization.id} organizationName={organization.name} />
        </TabsContent>

        <TabsContent value="configuration" className="m-0 animate-in fade-in duration-300">
          <ConfigurationsTable entityId={organization.id} entityType="organization" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OrganizationDetail

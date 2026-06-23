import { useParams, useNavigate, useSearchParams } from "react-router-dom"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActiveStatusBadge } from "@/columns"
import { getInitials } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"
import { useOrganizationDetail, useOrganizationTenants } from "@/api/hooks/useOrganizations"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ConfigurationsTable } from "@/pages/organization/components/configurations-table"
import { OrganizationTenantsTab } from "@/pages/organization/components/organization-tenants-tab"
import { ProfileTable } from "@/pages/organization/components/profile-table"
import { PageShell } from "@/components/invoice-ui/design-system"


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
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "tenants"

  const { data: organization, isLoading, isError } = useOrganizationDetail(id)
  const { data: tenants = [] } = useOrganizationTenants(id)

  if (isError || (!isLoading && !organization)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load organization data.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/organizations")}>
          Back to organizations
        </Button>
      </PageShell>
    )
  }

  if (isLoading || !organization) return null



  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title="Organization Details"
        description="View and manage organization, tenants, and configurations."
      >
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border cursor-pointer" onClick={() => navigate("/organizations")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </PageHeader>

      {/* Details Card */}
      <div className="surface-card w-full overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/15">
                {getInitials(organization.name || "OR")}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-snug text-foreground" title={organization.name}>{organization.name}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{organization.id}</p>
              </div>
            </div>
          </div>

           <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Onboarding Status", content: <ActiveStatusBadge status={organization.onboarding_status || "Complete"} className="text-xxs px-2 py-0.5 font-medium border w-fit" /> },
              { label: "Tenants", content: <p className="text-sm font-semibold text-foreground">{organization.tenant_count ?? tenants.length}</p> },
              { label: "Slug / Domain", content: <p className="text-xs font-bold text-foreground truncate" title={organization.slug}>{organization.slug || "—"}</p> },
              { label: "Created At", content: <p className="text-xs font-semibold text-foreground">{formatDate(organization.created_at)}</p> },
              { label: "Updated At", content: <p className="text-xs font-semibold text-foreground">{formatDate(organization.updated_at)}</p> },
              { label: "Organization ID", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={organization.id}>{organization.id}</p> }
            ].map((item) => (
              <div key={item.label} className="flex min-h-20 flex-col justify-center rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/45">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">{item.label}</p>
                {item.content}
              </div>
            ))}
          </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
        <div>
          <TabsList>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="configuration">Configurations</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tenants" className="m-0 animate-in fade-in duration-300">
          <OrganizationTenantsTab orgId={organization.id} organizationName={organization.name} />
        </TabsContent>

        <TabsContent value="configuration" className="m-0 animate-in fade-in duration-300">
          <ConfigurationsTable entityId={organization.id} entityType="organization" />
        </TabsContent>

        <TabsContent value="profile" className="m-0 animate-in fade-in duration-300">
          <ProfileTable entityId={organization.id} entityType="organization" />
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}


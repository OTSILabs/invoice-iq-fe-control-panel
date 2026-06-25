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
import { DetailGrid } from "@/components/ui/detail-grid"


const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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
      <PageHeader
        title="Organization Details"
        description="View and manage organization, tenants, and configurations."
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 font-medium"
          onClick={() => navigate("/organizations")}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
      </PageHeader>

      {/* Details card */}
      <div className="surface-card overflow-hidden">
        {/* Identity row */}
        <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-xs font-bold uppercase text-primary ring-1 ring-primary/15">
            {getInitials(organization.name || "OR")}
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-[0.8125rem] font-semibold leading-snug text-foreground"
              title={organization.name}
            >
              {organization.name}
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              {organization.id}
            </p>
          </div>
        </div>

        {/* Meta fields */}
        <DetailGrid cols={3}>
          <DetailGrid.Item label="Status">
            <ActiveStatusBadge
              status={organization.onboarding_status || "Complete"}
              className="text-xxs px-2 py-0.5 font-medium border w-fit"
            />
          </DetailGrid.Item>
          <DetailGrid.Item label="Tenants">
            <p className="text-sm font-semibold text-foreground">
              {organization.tenant_count ?? tenants.length}
            </p>
          </DetailGrid.Item>
          <DetailGrid.Item label="Slug">
            <p className="truncate text-xs font-medium text-foreground" title={organization.slug}>
              {organization.slug || "—"}
            </p>
          </DetailGrid.Item>
          <DetailGrid.Item label="Created">
            <p className="text-xs font-medium text-foreground">{formatDate(organization.created_at)}</p>
          </DetailGrid.Item>
          <DetailGrid.Item label="Updated">
            <p className="text-xs font-medium text-foreground">{formatDate(organization.updated_at)}</p>
          </DetailGrid.Item>
          <DetailGrid.Item label="Organization ID">
            <p className="truncate font-mono text-xs text-foreground" title={organization.id}>
              {organization.id}
            </p>
          </DetailGrid.Item>
        </DetailGrid>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setSearchParams({ tab: val })}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="configuration">Configurations</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

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
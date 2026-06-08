import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { organizationsService } from "@/api/services/organizations.service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ConfigurationsTable } from "@/pages/organization/configurations-table"
import { OrganizationFacts } from "./organization-facts"
import { OrganizationTenantsTab } from "./organization-tenants-tab"

export function OrganizationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: organization,
    isLoading: isOrgLoading,
    isError: isOrgError,
  } = useQuery({
    queryKey: ["organizations", id],
    queryFn: () => organizationsService.getById(id!),
    enabled: !!id,
  })

  if (isOrgLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isOrgError || !organization) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Failed to load organization data.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/organizations")}>
          Back to organizations
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-12 animate-in fade-in duration-300">

      {/* ── Two-column layout ── */}
      <Tabs defaultValue="tenants" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-6 items-start">

          {/* Sidebar — always visible, parallel to tab content */}
          <aside>
            <div className="mb-6 flex items-center h-9">
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-1 text-xs text-muted-foreground hover:text-foreground shadow-none"
                onClick={() => navigate("/organizations")}
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to organizations
              </Button>
            </div>
            <OrganizationFacts organization={organization} />
          </aside>

          {/* Main panel */}
          <div className="w-full min-w-0">
            <TabsList variant="line" className="mb-6 h-9 justify-start gap-6 [&>button]:flex-none">
              <TabsTrigger value="tenants">Tenants</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="tenants" className="m-0 animate-in fade-in duration-300">
              <OrganizationTenantsTab
                orgId={organization.id}
                organizationName={organization.name}
              />
            </TabsContent>

            <TabsContent value="configuration" className="m-0 animate-in fade-in duration-300">
              <ConfigurationsTable entityId={organization.id} entityType="organization" />
            </TabsContent>
          </div>

        </div>
      </Tabs>

    </div>
  )
}

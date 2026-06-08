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

  const { data: organization, isLoading: isOrgLoading, isError: isOrgError } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationsService.getById(id!),
    enabled: !!id
  })

  if (isOrgLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isOrgError || !organization) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Failed to load organization data.</p>
        <Button variant="outline" onClick={() => navigate('/organizations')}>
          Back to Organizations
        </Button>
      </div>
    )
  }


  return (
    <div className="grid w-full animate-in grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr] gap-6 pb-12 items-start duration-300 fade-in font-sans">
     {/* ── Sidebar ── */}
      <aside className="flex flex-col gap-3">

        {/* Org header card */}
       

        {/* Facts card — replace rows with your actual OrganizationFacts content */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <OrganizationFacts organization={organization} />
        </div>

        {/* Back button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => navigate('/organizations')}
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Back to organizations
        </Button>
      </aside>


      <div className="w-full min-w-0">
        <Tabs defaultValue="configuration" className="w-full">
          <TabsList variant="line" className="mb-6 justify-start gap-6 [&>button]:flex-none">
             <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
           
          </TabsList>

          <TabsContent value="configuration" className="m-0 animate-in fade-in-50 duration-300">
            <ConfigurationsTable entityId={organization.id} entityType="organization" />
          </TabsContent>

          <TabsContent value="tenants" className="m-0 animate-in fade-in-50 duration-300">
            <OrganizationTenantsTab orgId={organization.id} organizationName={organization.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

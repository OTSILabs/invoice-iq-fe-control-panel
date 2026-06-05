import { Building2, Plus, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { useQuery } from "@tanstack/react-query"
import { organizationsService } from "@/api/services/organizations.service"
import { useNavigate } from "react-router-dom"

export function Organizations() {
  const navigate = useNavigate()
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsService.getAll
  })

  return (
      <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Organizations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and create organizations within your control panel.</p>
        </div>
        <CreateOrganizationModal>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-md px-5 font-semibold tracking-wide">
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </CreateOrganizationModal>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : organizations && organizations.length > 0  ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <Card 
              key={org.id} 
              className="cursor-pointer transition-all hover:border-primary/50 flex flex-col group"
              onClick={() => navigate(`/organizations/${org.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="truncate text-base font-semibold group-hover:text-primary transition-colors">
                    {org.name}
                  </CardTitle>
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
                <CardDescription className="truncate text-[12px] font-mono mt-1">
                  {org.slug}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium text-foreground mr-1.5">{org.tenant_count || 0}</span>
                  <span>Tenants</span>
                </div>
              </CardContent>
            </Card>
          ))}</div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-12 mt-8">
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center border-[1.5px] border-dashed border-border rounded-2xl bg-card w-[90%] sm:w-[400px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4 text-primary border border-primary/20"><Building2 className="h-5 w-5" /></div>
            <h3 className="text-base font-bold text-foreground mb-1.5 tracking-tight">No organizations found</h3>
            <p className="text-muted-foreground text-[13px] mb-6 leading-relaxed max-w-[280px]">You haven't created any organizations yet. Get started by creating your first one.</p>
            <CreateOrganizationModal>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted rounded-md px-5 h-9 font-semibold bg-card text-[13px] transition-all hover:border-border"><Plus className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />Create Organization</Button>
            </CreateOrganizationModal>
          </div>
        </div>
      )}
    </div>
  )
}


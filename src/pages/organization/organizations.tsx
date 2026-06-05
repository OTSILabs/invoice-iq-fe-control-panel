import { organizationsService } from "@/api/services/organizations.service"
import { Button } from "@/components/ui/button"
import { CreateOrganizationModal } from "@/pages/organization/modals/create-organization-modal"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Building2, Loader2, Plus } from "lucide-react"
import { Link } from "react-router-dom"

export function Organizations() {

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationsService.getAll,
  })

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and create organizations within your control panel.
          </p>
        </div>
        <CreateOrganizationModal>
          <Button size="sm" className="gap-1.5 shrink-0">
            <Plus className="h-3.5 w-3.5" />
            Create organization
          </Button>
        </CreateOrganizationModal>
      </div>

   
      {/* Content */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : organizations && organizations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="group relative border border-border rounded-xl p-5 bg-card hover:border-border/80 transition-colors"
            >
              {/* Card content */}
              <div className="truncate font-medium text-sm">{org.name}</div>
              <div>
                 
                  <span className="text-xs text-muted-foreground ">Tenants -</span>
                   <span className="text-xs text-muted-foreground ml-1.5 font-semibold">{org.tenant_count ?? 0}</span>
                </div>
              <div className="truncate font-mono text-xs text-muted-foreground mt-0.5">{org.slug}</div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                  <Link to={`/organizations/${org.id}`}>
                    Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
              

              
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm mb-1">No organizations yet</p>
          <p className="text-xs text-muted-foreground mb-4">Get started by creating your first one.</p>
          <CreateOrganizationModal>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Create organization
            </Button>
          </CreateOrganizationModal>
        </div>
      )}
    </div>
  )
}
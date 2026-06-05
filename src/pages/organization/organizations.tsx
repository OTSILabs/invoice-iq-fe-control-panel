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
          <Button size="lg" className="gap-2 bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold rounded-full px-6 w-auto h-11">
            <Plus className="h-4 w-4" />
            Create Organization
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
              className="group relative border border-border rounded-xl p-5 bg-card hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Card content */}
              <div className="flex flex-col gap-1 flex-1">
                <div className="truncate font-medium text-sm text-foreground group-hover:text-primary transition-colors">{org.name}</div>
                <div className="truncate font-mono text-[11px] text-muted-foreground">{org.slug}</div>
              </div>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-border">
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground">Tenants:</span>
                  <span className="text-xs text-foreground ml-1.5 font-semibold">{org.tenant_count ?? 0}</span>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary hover:bg-primary/90! hover:text-primary-foreground! transition-all duration-300" asChild>
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
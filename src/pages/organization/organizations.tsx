import { Building2, Plus, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateOrganizationModal } from "@/components/create-organization-modal"
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
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Organizations</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and create organizations within your control panel.</p>
        </div>
        <CreateOrganizationModal>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-md px-5 font-semibold tracking-wide">
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </CreateOrganizationModal>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : organizations && organizations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <div key={org.id} onClick={() => navigate(`/organizations/${org.id}`)} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{org.name}</h3>
                  <p className="text-[12px] text-slate-500 font-mono">{org.slug}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-[13px] text-slate-500">
                <span>Tenants: {org.tenant_count || 0}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center -mt-16">
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center border-[1.5px] border-dashed border-slate-300/80 rounded-2xl bg-white w-[90%] sm:w-[400px] shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 mb-4 text-blue-600 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-blue-100">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">No organizations found</h3>
            <p className="text-slate-500 text-[13px] mb-6 leading-relaxed max-w-[280px]">
              You haven't created any organizations yet. Get started by creating your first one.
            </p>
            <CreateOrganizationModal>
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md px-5 h-9 shadow-sm font-semibold bg-white text-[13px] transition-all hover:border-slate-300">
                <Plus className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                Create Organization
              </Button>
            </CreateOrganizationModal>
          </div>
        </div>
      )}
    </div>
  )
}

import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Building2, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { organizationsService } from "@/api/services/organizations.service"

export function OrganizationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: organization, isLoading, isError } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationsService.getById(id!),
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError || !organization) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">Failed to load organization data.</p>
        <Button variant="outline" onClick={() => navigate('/organizations')}>
          Back to Organizations
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full">
      <div className="flex items-center gap-4 pb-2 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/organizations')} className="h-8 w-8 rounded-full border border-slate-200 shadow-sm bg-white hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{organization.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">Tenant: {organization.slug} | Plan: {organization.plan_id}</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Organization Overview</h3>
            <p className="text-[13px] text-slate-500">Details fetched dynamically via route ID.</p>
          </div>
        </div>
        
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <pre className="text-[13px] text-slate-700 font-mono overflow-auto">
            {JSON.stringify(organization, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

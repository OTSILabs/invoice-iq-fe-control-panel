import { Info } from "lucide-react"

import type { Organization } from "@/types"

export function OrganizationFacts({ organization }: { organization: Organization | null }) {
  if (!organization) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-8 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Organization Facts</h3>
            <p className="text-[13px] text-muted-foreground">Key details and configuration for this organization.</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-x-10 gap-y-6 pt-2">
        <span className="text-sm flex items-center gap-2">
          <span className="font-medium text-muted-foreground">Organization ID:</span>
          <span className="font-semibold text-foreground">{organization.id}</span>
        </span>
        <span className="text-sm flex items-center gap-2">
          <span className="font-medium text-muted-foreground">Name:</span>
          <span className="font-semibold text-foreground">{organization.name}</span>
        </span>
        <span className="text-sm flex items-center gap-2">
          <span className="font-medium text-muted-foreground">Tenant Count:</span>
          <span className="font-semibold text-foreground">{organization.tenant_count?.toString() || '0'}</span>
        </span>
        <span className="text-sm flex items-center gap-2">
          <span className="font-medium text-muted-foreground">Status:</span>
          <span className="font-semibold text-foreground">{organization.status || 'Active'}</span>
        </span>
        <span className="text-sm flex items-center gap-2">
          <span className="font-medium text-muted-foreground">Created At:</span>
          <span className="font-semibold text-foreground">
            {organization.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}
          </span>
        </span>
      </div>
    </div>
  )
}

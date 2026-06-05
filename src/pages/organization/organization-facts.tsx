import { Info } from "lucide-react"

import type { Organization } from "@/types"

export function OrganizationFacts({ organization }: { organization: Organization | null }) {
  if (!organization) return null;

  const facts = [
    { label: "Organization ID", value: organization.id },
    { label: "Name", value: organization.name },
    { label: "Tenant Count", value: organization.tenant_count?.toString() || '0' },
    { label: "Status", value: organization.status || 'Active' },
    { label: "Created At", value: organization.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-8 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20"><Info className="h-5 w-5" /></div>
          <div><h3 className="font-semibold text-foreground">Organization Facts</h3><p className="text-[13px] text-muted-foreground">Key details and configuration for this organization.</p></div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-x-10 gap-y-6 pt-2">
        {facts.map((fact, i) => (
          <span key={i} className="text-sm flex items-center gap-2">
            <span className="font-medium text-muted-foreground">{fact.label}:</span>
            <span className="font-semibold text-foreground">{fact.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

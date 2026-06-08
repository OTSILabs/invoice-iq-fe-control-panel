
import { Badge } from "@/components/ui/badge"
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
    
  const initials = organization.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()


  return (
    <div className="bg-card border border-border rounded-xl p-8 shrink-0 shadow-sm font-sans">

<div className="flex items-start justify-between gap-4 mb-6 border-b border-border pb-6">
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-medium text-lg">
      {initials}
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-[15px] font-medium text-foreground">{organization.name}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{organization.id}</p>
    </div>
  </div>

  <Badge variant="outline" className="w-fit text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
    Active
  </Badge>
</div>
      
      <div className="flex flex-col gap-y-5">
        {facts.map((fact, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{fact.label}</span>
            <span className="text-sm font-semibold text-foreground truncate" title={fact.value}>{fact.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

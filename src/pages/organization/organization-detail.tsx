import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Edit2, Building2, Users, CheckCircle2, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { organizationsService } from "@/api/services/organizations.service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ConfigurationsTable } from "@/pages/organization/configurations-table"
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

  const { data: tenants = [] } = useQuery({
    queryKey: ["organizations", id, "tenants"],
    queryFn: () => organizationsService.getTenants(id!),
    enabled: !!id,
  })

  const { data: configurations = [] } = useQuery({
    queryKey: ["organizations", id, "configurations"],
    queryFn: () => organizationsService.getConfigurations(id!),
    enabled: !!id,
  })

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const onboardingStatus = (organization?.onboarding_status ?? "complete").toLowerCase()
  const onboardingCfg: Record<string, { label: string; className: string }> = {
    complete:    { label: "Complete",    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900" },
    pending:     { label: "Pending",     className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900" },
    in_progress: { label: "In progress", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900" },
  }
  const onboardingStyle = onboardingCfg[onboardingStatus] ?? onboardingCfg.complete

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return "N/A"
      const day = String(d.getDate()).padStart(2, '0')
      const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = allMonths[d.getMonth()]
      const year = d.getFullYear()
      
      let hours = d.getHours()
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12
      const hourStr = String(hours).padStart(2, '0')
      
      return `${day} ${month} ${year}, ${hourStr}:${minutes} ${ampm}`
    } catch {
      return "N/A"
    }
  }

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
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Breadcrumb Back Link & Action Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground shadow-none -ml-2"
              onClick={() => navigate("/organizations")}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to organizations
            </Button>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Organization Details</h1>
          <p className="text-sm text-muted-foreground">
            View and manage organization, tenants and configurations
          </p>
        </div>
        
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border shadow-sm cursor-pointer" onClick={() => toast.info("Edit Organization functionality is coming soon.")}>
          <Edit2 className="h-4 w-4" />
          Edit Organization
        </Button>
      </div>

      {/* ── Details Section (Summary Card taking full width) ── */}
      <div className="w-full">
        {/* Summary Card (Styled in previous facts card style) */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          {/* Accent stripe */}
          <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />

          {/* Hero */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold uppercase">
                {organization?.name ? getInitials(organization.name) : "OR"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate" title={organization.name}>
                  {organization.name}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{organization.id}</p>
              </div>
            </div>
          </div>

          {/* Facts mosaic (Grid of details using border trick) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Onboarding</p>
              <Badge variant="outline" className={cn("text-[11px] px-2 py-0.5 font-medium border w-fit", onboardingStyle.className)}>
                {onboardingStyle.label}
              </Badge>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tenants</p>
              <p className="text-sm font-semibold text-foreground">{organization.tenant_count ?? tenants.length}</p>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Slug / Domain</p>
              <p className="text-xs font-bold text-foreground truncate" title={organization.slug}>
                {organization.slug || "—"}
              </p>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Created At</p>
              <p className="text-xs font-semibold text-foreground">{formatDate(organization.created_at)}</p>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Updated At</p>
              <p className="text-xs font-semibold text-foreground">{formatDate(organization.updated_at)}</p>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Organization ID</p>
              <p className="font-mono text-[11px] font-medium text-foreground truncate" title={organization.id}>
                {organization.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Content (Tenants & Configurations) ── */}
      <Tabs defaultValue="tenants" className="w-full">
        <TabsList variant="line" className="mb-4 h-9 justify-start gap-6 [&>button]:flex-none border-b border-border w-full">
          <TabsTrigger value="tenants" className="cursor-pointer">
            Tenants ({tenants.length})
          </TabsTrigger>
          <TabsTrigger value="configuration" className="cursor-pointer">
            Configurations ({configurations.length})
          </TabsTrigger>
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
      </Tabs>

    </div>
  )
}

export default OrganizationDetail

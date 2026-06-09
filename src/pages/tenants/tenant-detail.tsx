import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Loader2, ArrowLeft, Edit2, Building2, Users, CheckCircle2, Calendar, Clock, Database, User, Info, FileText, Eye, EyeOff, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ConfigurationsTable } from "@/pages/organization/configurations-table"
import { TenantEventsTable } from "@/pages/tenants/tenant-events-table"
import { organizationsService } from "@/api/services/organizations.service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copied`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }
  return (
    <button
      onClick={handleCopy}
      className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1.5 cursor-pointer"
      title={`Copy ${label}`}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

function CopyableField({ value, label, isSensitive = false }: { value: string; label: string; isSensitive?: boolean }) {
  const [show, setShow] = useState(!isSensitive)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copied`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const displayValue = show ? value : "••••••••••••••••"

  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 max-w-[70%]">
        <span className="text-xs font-mono font-bold text-foreground truncate" title={show ? value : undefined}>
          {displayValue}
        </span>
        <div className="flex items-center gap-1">
          {isSensitive && (
            <button
              onClick={() => setShow(!show)}
              className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={show ? "Hide" : "Show"}
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={!value}
            className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Copy"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function TenantDetail() {
  const { orgId, tenantId } = useParams<{ orgId: string; tenantId: string }>()
  const navigate = useNavigate()
  const { data: tenants = [], isLoading, isError } = useQuery({
    queryKey: ['organizations', orgId, 'tenants'],
    queryFn: () => organizationsService.getTenants(orgId!),
    enabled: !!orgId
  })

  const tenant = tenants.find((t) => t.id === tenantId)

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !tenant) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Failed to load tenant data or tenant not found.</p>
        <Button variant="outline" onClick={() => navigate(`/organizations/${orgId}`)}>
          Back to Organization
        </Button>
      </div>
    )
  }

  const initials = tenant.tenant_admin_full_name
    ? getInitials(tenant.tenant_admin_full_name)
    : "TN"

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
              onClick={() => navigate(`/organizations/${orgId}`)}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Tenants
            </Button>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Tenant Details</h1>
          <p className="text-sm text-muted-foreground">
            View and manage tenant parameters, profile and events log
          </p>
        </div>
        
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border shadow-sm cursor-pointer" onClick={() => toast.info("Edit Tenant functionality is coming soon.")}>
          <Edit2 className="h-4 w-4" />
          Edit Tenant
        </Button>
      </div>

      {/* ── Details Card (Summary Card styled like organization facts card) ── */}
      <div className="w-full">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          {/* Accent stripe */}
          <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />

          {/* Hero */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold uppercase">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground leading-snug truncate" title={tenant.tenant_admin_full_name}>
                    {tenant.tenant_admin_full_name || tenant.id}
                  </p>
                  <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    {tenant.access_status || "Active"}
                  </Badge>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">{tenant.id}</p>
              </div>
            </div>
          </div>

          {/* Facts mosaic (Grid of details using border trick) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tenant ID</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium text-foreground truncate" title={tenant.id}>
                  {tenant.id}
                </span>
                <CopyButton value={tenant.id} label="Tenant ID" />
              </div>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Organization ID</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium text-foreground truncate" title={tenant.organisation_id || orgId}>
                  {tenant.organisation_id || orgId}
                </span>
                <CopyButton value={tenant.organisation_id || orgId || ""} label="Organization ID" />
              </div>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Slug</p>
              <p className="text-xs font-semibold text-foreground truncate" title={tenant.slug}>
                {tenant.slug || "—"}
              </p>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tenant Role</p>
              <p className="text-xs font-bold text-foreground capitalize">
                {tenant.tenant_role?.replace('_', ' ') || "Standard"}
              </p>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Access Status</p>
              <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400 w-fit">
                {tenant.access_status || "Active"}
              </Badge>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Provisioning Status</p>
              <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-medium border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400 w-fit">
                {tenant.provisioning_status || "Completed"}
              </Badge>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Created At</p>
              <p className="text-xs font-semibold text-foreground">{formatDate(tenant.created_at)}</p>
            </div>

            <div className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Updated At</p>
              <p className="text-xs font-semibold text-foreground">{formatDate(tenant.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Content (Profile, Configurations, Database, Events) ── */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList variant="line" className="mb-6 justify-start gap-6 [&>button]:flex-none border-b border-border w-full">
          <TabsTrigger value="profile" className="cursor-pointer">Profile</TabsTrigger>
          <TabsTrigger value="configuration" className="cursor-pointer">Configurations</TabsTrigger>
          <TabsTrigger value="database" className="cursor-pointer">Database</TabsTrigger>
          <TabsTrigger value="events" className="cursor-pointer">Events</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="m-0 animate-in fade-in duration-300 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Profile Details */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[260px]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Tenant Profile</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Display Name</span>
                    <span className="text-xs font-semibold text-foreground">{tenant.profile?.display_name || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Domain Name</span>
                    <span className="text-xs font-semibold text-foreground">{tenant.profile?.domain_name || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Reporting Currency</span>
                    <span className="text-xs font-semibold text-foreground">{tenant.profile?.reporting_currency || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Timezone</span>
                    <span className="text-xs font-semibold text-foreground">{tenant.profile?.timezone || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Full Name</span>
                    <span className="text-xs font-semibold text-foreground">{tenant.tenant_admin_full_name || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin Email</span>
                    <span className="text-xs font-semibold text-foreground truncate block" title={tenant.tenant_admin_email}>{tenant.tenant_admin_email || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Subscription Plan */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[260px]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Subscription Plan</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Effective Plan ID</span>
                    <span className="text-xs font-mono font-semibold text-foreground">{tenant.effective_plan_id || "—"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Plan Valid From</span>
                    <span className="text-xs font-semibold text-foreground">{formatDate(tenant.effective_plan_valid_from)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Plan Valid To</span>
                    <span className="text-xs font-semibold text-foreground">{formatDate(tenant.effective_plan_valid_to)}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled
                  className="w-full text-xs font-medium cursor-not-allowed opacity-60"
                >
                  Manage Subscription
                </Button>
              </div>
            </div>

            {/* Card 3: Governance & Compliance */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[260px]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Governance & Compliance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Governance Blocked</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 w-fit mt-0.5",
                        tenant.governance_blocked 
                          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                      )}
                    >
                      {tenant.governance_blocked ? "Blocked" : "Active / Unblocked"}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Governance Outcome</span>
                    <span className="text-xs font-semibold text-foreground truncate" title={tenant.governance_outcome || "None"}>
                      {tenant.governance_outcome || "None"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Provisioned At</span>
                    <span className="text-xs font-semibold text-foreground">{formatDate(tenant.provisioned_at)}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled
                  className="w-full text-xs font-medium cursor-not-allowed opacity-60"
                >
                  Manage Governance
                </Button>
              </div>
            </div>

          </div>

          {tenant.last_error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-start gap-2.5">
              <Info className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block">Last Provisioning Error Logged</span>
                <p className="text-xs font-mono break-all">{tenant.last_error}</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* CONFIGURATIONS TAB */}
        <TabsContent value="configuration" className="m-0 animate-in fade-in duration-300">
          <ConfigurationsTable entityId={tenant.id} entityType="tenant" />
        </TabsContent>

        {/* DATABASE TAB */}
        <TabsContent value="database" className="m-0 animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">Database Configurations</h3>
              <p className="text-xs text-muted-foreground">View primary connection settings and database credentials for this tenant.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Database Engine</span>
                  <span className="text-xs font-bold text-foreground">PostgreSQL</span>
                </div>
                <CopyableField label="Database Name" value={tenant.db_name || ""} isSensitive={true} />
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Port</span>
                  <span className="text-xs font-mono font-bold text-foreground">{tenant.db_port || "—"}</span>
                </div>
              </div>

              <div className="space-y-4">
                <CopyableField label="Host Address" value={tenant.db_host || ""} isSensitive={true} />
                <CopyableField label="Master Username" value={tenant.db_user || ""} isSensitive={true} />
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs font-semibold text-muted-foreground">SSL Mode</span>
                  <span className="text-xs font-bold text-foreground">Require</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="m-0 animate-in fade-in duration-300">
          <TenantEventsTable tenantId={tenant.id} />
        </TabsContent>
      </Tabs>

    </div>
  )
}

export default TenantDetail;

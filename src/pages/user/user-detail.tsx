import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePlatformUser } from "@/api/hooks/useUsers"
import { getInitials } from "@/lib/utils"
import type { PlatformUser } from "@/types"
import { ActiveStatusBadge } from "@/columns"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell } from "@/components/invoice-ui/design-system"

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}

const getRolesList = (u: PlatformUser | null | undefined): string[] => {
  if (!u) return []
  const raw = Array.isArray(u.roles) ? u.roles : Array.isArray(u.role_names) ? u.role_names : [u.role, u.role_name]
  return raw.reduce<string[]>((acc, r: unknown) => {
    if (r) {
      const name = typeof r === "string" ? r : (r as { name?: string })?.name || ""
      if (name) acc.push(name)
    }
    return acc
  }, [])
}

const getRoleBadgeVariant = (role: string) => {
  const r = role?.toLowerCase()
  const base = "font-semibold text-[10px] px-1.5 py-0.5"
  if (r === "admin") return { variant: "outline" as const, className: `${base} border-primary text-primary` }
  if (r === "user" || r === "standard user") return { variant: "secondary" as const, className: `${base} bg-slate-100 text-foreground hover:bg-slate-200` }
  return { variant: "outline" as const, className: base }
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: user, isLoading, isError } = usePlatformUser(id || "")

  if (isLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </PageShell>
    )
  }

  if (isError || !user) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load platform user details.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/users")}
        >
          Back to Users
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title="User Details"
        description="View system access accounts and assigned roles for this user."
      >
          <Button
            variant="outline"
            size="sm"
            className="font-medium gap-1.5 border-border shadow-sm cursor-pointer"
            onClick={() => navigate("/users")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="font-medium gap-1.5 cursor-not-allowed shadow-sm opacity-50"
            disabled
          >
            <Trash2 className="h-4 w-4" /> Delete User
          </Button>
      </PageHeader>

      {/* Details Card */}
      <div className="surface-card w-full overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-lg border bg-background flex-shrink-0">
                <AvatarFallback className="rounded-lg bg-primary/8 text-sm font-semibold text-primary uppercase">
                  {getInitials(user.full_name) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-snug text-foreground" title={user.full_name}>
                  {user.full_name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "User ID",
                content: (
                  <p className="font-mono text-xs font-semibold text-foreground truncate" title={user.id}>
                    {user.id}
                  </p>
                )
              },
              {
                label: "Full Name",
                content: <p className="text-xs font-semibold text-foreground">{user.full_name}</p>
              },
              {
                label: "Email Address",
                content: (
                  <p className="text-xs font-semibold text-foreground truncate" title={user.email}>
                    {user.email}
                  </p>
                )
              },
              {
                label: "Status",
                content: (
                  <ActiveStatusBadge status={user.status || "ACTIVE"} className="text-xxs px-2 py-0.5 font-semibold" />
                )
              },
              {
                label: "Created At",
                content: <p className="text-xs font-semibold text-foreground">{formatDate(user.created_at)}</p>
              },
              {
                label: "Updated At",
                content: <p className="text-xs font-semibold text-foreground">{formatDate(user.created_at)}</p>
              }
            ].map((item) => (
              <div key={item.label} className="flex min-h-20 flex-col justify-center rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/45">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">{item.label}</p>
                {item.content}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-border/45 bg-card px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Roles</p>
            <div className="flex flex-wrap gap-1.5">
              {getRolesList(user).map((role) => {
                const badge = getRoleBadgeVariant(role)
                return (
                  <Badge key={role} variant={badge.variant} className={badge.className}>
                    {String(role).toUpperCase()}
                  </Badge>
                )
              })}
            </div>
          </div>
      </div>
    </PageShell>
  )
}

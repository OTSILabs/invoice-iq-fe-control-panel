import { useParams, useNavigate, Navigate } from "react-router-dom"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePlatformUser } from "@/api/hooks/useUsers"
import { getInitials } from "@/lib/utils"
import { ActiveStatusBadge } from "@/components/invoice-ui/active-status-badge"
import { RoleBadge } from "@/components/invoice-ui/role-badge"
import { getRolesList } from "@/columns-data"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell } from "@/components/invoice-ui/design-system"
import { DetailGrid } from "@/components/ui/detail-grid"

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

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const isCreate = id === "create"
  const { data: user, isLoading, isError } = usePlatformUser(id || "", !isCreate)

  if (isCreate) {
    return <Navigate to="/users/create" replace />
  }

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
            className="font-medium gap-1.5 border-border  "
            onClick={() => navigate("/users")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="font-medium gap-1.5 cursor-not-allowed opacity-50"
            disabled
          >
            <Trash2 className="h-4 w-4" /> Delete User
          </Button>
      </PageHeader>

      {/* Details Card */}
      <div className="surface-card w-full overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-lg border bg-background shrink-0">
                <AvatarFallback className="rounded-lg bg-primary/8 text-sm font-semibold text-primary">
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

          <DetailGrid cols={3}>
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
                  <ActiveStatusBadge status={user.status || "ACTIVE"} className="text-xxs px-2 py-0.5 font-semibold border w-fit" />
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
              <DetailGrid.Item key={item.label} label={item.label}>
                {item.content}
              </DetailGrid.Item>
            ))}
          </DetailGrid>

          <div className="flex flex-col gap-2 border-t border-border/45 bg-card px-5 py-5">
            <p className="text-xs text-muted-foreground">Assigned Roles</p>
            <div className="flex flex-wrap gap-1.5">
              {getRolesList(user).map((role: string) => <RoleBadge key={role} role={role} />)}
            </div>
          </div>
      </div>
    </PageShell>
  )
}

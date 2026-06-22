import { useQuery } from "@tanstack/react-query"
import { Activity } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { organizationsService } from "@/api/services/organizations.service"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"

interface TenantEventsTableProps {
  tenantId: string;
}

export function TenantEventsTable({ tenantId }: TenantEventsTableProps) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['tenants', tenantId, 'events'],
    queryFn: () => organizationsService.getTenantEvents(tenantId),
    enabled: !!tenantId
  })

const columns = useMemo<CustomColumnDef<any>[]>(() => [
  {
    accessorKey: "event_type",
    header: "Event Type",
    width: "25%",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-foreground font-mono">
        {row.original.event_type || row.original.type || "Unknown"}
      </span>
    ),
  },
  {
    accessorKey: "message",
    header: "Message",
    width: "45%",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.message || row.original.detail || "-"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    width: "15%",
    cell: ({ row }) => {
      const status = row.original.status || "Completed"
      const isSuccess = status.toLowerCase() === 'completed' || status.toLowerCase() === 'success'
      return (
        <Badge
          variant={isSuccess ? "secondary" : "outline"}
          className={isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "text-muted-foreground"}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    width: "15%",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.created_at || row.original.timestamp
          ? new Date(row.original.created_at || row.original.timestamp).toLocaleDateString()
          : "N/A"}
      </span>
    ),
  },
], [])

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[300px]">
      <div className="flex items-center gap-3 p-5 pb-4 border-b border-border/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tenant Events</h3>
          <p className="text-[12px] text-muted-foreground">Audit logs and activity history for this tenant.</p>
        </div>
      </div>

      <div className="relative">
        <DataTable
          data={Array.isArray(events) ? events : []}
          columns={columns}
          isLoading={isLoading}
          enablePagination={true}
          pageSize={10}
          totalItems={Array.isArray(events) ? events.length : 0}
          stickyHeader
          tableContainerClassName="border-0 rounded-none bg-transparent"
          emptyState={
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <h3 className="text-sm font-semibold text-foreground">No Events Found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                No activity history recorded for this tenant yet.
              </p>
            </div>
          }
        />
      </div>
    </div>
  )
}

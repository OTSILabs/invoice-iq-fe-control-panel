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
      width: 200,
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 ">
          {row.original.event_type || row.original.type || "Unknown"}
        </span>
      ),
    },
    {
      accessorKey: "message",
      header: "Message",
      width: 350,
      cell: ({ row }) => (
        <span className="text-slate-600 ">
          {row.original.message || row.original.detail || "-"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      width: 120,
      cell: ({ row }) => {
        const status = row.original.status || "Completed";
        const isSuccess = status.toLowerCase() === 'completed' || status.toLowerCase() === 'success';
        return (
          <Badge
            variant={isSuccess ? "secondary" : "outline"}
            className={
              isSuccess
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "text-slate-400"
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      width: 180,
      cell: ({ row }) => (
        <span className="text-xs text-slate-400">
          {row.original.created_at || row.original.timestamp
            ? new Date(row.original.created_at || row.original.timestamp).toLocaleString()
            : "N/A"}
        </span>
      ),
    },
  ], [])

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[300px]">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Tenant Events</h3>
            <p className="text-[13px] text-slate-500">Audit logs and activity history for this tenant.</p>
          </div>
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
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center flex-1">
              <div className="mx-auto max-w-md space-y-4">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  No Events Found
                </h3>
                <p className="text-sm text-slate-500">
                  There is no activity history recorded for this tenant yet.
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}

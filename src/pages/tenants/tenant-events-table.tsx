import type { TenantEventsTableProps } from "@/types";
import { useQuery } from "@tanstack/react-query"
import { Activity } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { organizationsService } from "@/api/services/organizations.service"
import { tenantEventsTableColumns } from "@/columns"


export function TenantEventsTable({ tenantId }: TenantEventsTableProps) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['tenants', tenantId, 'events'],
    queryFn: () => organizationsService.getTenantEvents(tenantId),
    enabled: !!tenantId
  })

  const columns = tenantEventsTableColumns

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

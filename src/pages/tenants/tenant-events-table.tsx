import type { TenantEventsTableProps } from "@/types";
import { useQuery } from "@tanstack/react-query"
import { Activity } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { organizationsService } from "@/api/services/organizations.service"
import { tenantEventsTableColumns } from "@/columns"
import { EmptyState, FilterBar } from "@/components/invoice-ui/design-system"


export function TenantEventsTable({ tenantId }: TenantEventsTableProps) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['tenants', tenantId, 'events'],
    queryFn: () => organizationsService.getTenantEvents(tenantId),
    enabled: !!tenantId
  })

  const columns = tenantEventsTableColumns

  return (
    <div className="table-container min-h-[300px]">
      <FilterBar className="justify-start p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tenant Events</h3>
          <p className="text-[12px] text-muted-foreground">Audit logs and activity history for this tenant.</p>
        </div>
      </FilterBar>

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
              <EmptyState
                icon={Activity}
                title="No events found"
                description="No activity history recorded for this tenant yet."
                className="min-h-0 border-0 bg-transparent py-6"
              />
            </div>
          }
        />
      </div>
    </div>
  )
}

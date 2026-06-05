import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { organizationsService } from "@/api/services/organizations.service"
import type { Configuration } from "@/types"
import { CreateConfigurationDialog } from "./modals/create-configuration-dialog"

interface ConfigurationsTableProps {
  entityId: string;
  entityType: 'organization' | 'tenant';
}

export function ConfigurationsTable({ entityId, entityType }: ConfigurationsTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const queryKeyType = entityType === 'organization' ? 'organizations' : 'tenants'

  const { data: configurations = [], isLoading } = useQuery({
    queryKey: [queryKeyType, entityId, 'configurations'],
    queryFn: () => entityType === 'organization'
      ? organizationsService.getConfigurations(entityId)
      : organizationsService.getTenantConfigurations(entityId),
    enabled: !!entityId
  })

  const columns = useMemo<CustomColumnDef<Configuration>[]>(() => [
    { accessorKey: "key", header: "Key", width: 250, cell: ({ row }) => <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-sm">{row.original.key}</span> },
    { accessorKey: "value", header: "Value", width: 300, cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.original.value}</span> },
    { accessorKey: "is_active", header: "Status", width: 120, cell: ({ row }) => <Badge variant={row.original.is_active ? "secondary" : "outline"} className={row.original.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "text-slate-400"}>{row.original.is_active ? "Active" : "Inactive"}</Badge> },
    { accessorKey: "is_editable_by_tenant", header: "Tenant Editable", width: 150, cell: ({ row }) => <Badge variant={row.original.is_editable_by_tenant ? "secondary" : "outline"} className={row.original.is_editable_by_tenant ? "border-blue-200 bg-blue-50 text-blue-700" : "text-slate-400"}>{row.original.is_editable_by_tenant ? "Yes" : "No"}</Badge> },
  ], [])

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[300px]">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Configuration Settings</h3>
            <p className="text-[13px] text-slate-500">Manage settings and configurations for this {entityType}.</p>
          </div>
        </div>
        <CreateConfigurationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} entityId={entityId} entityType={entityType} />
      </div>
      
      <div className="relative">
        <DataTable
          data={configurations}
          columns={columns}
          isLoading={isLoading}
          enablePagination={true}
          pageSize={10}
          totalItems={configurations.length}
          stickyHeader
          tableContainerClassName="border-0 rounded-none bg-transparent"
          emptyState={
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center flex-1">
              <div className="mx-auto max-w-md space-y-4">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  No Configurations Yet
                </h3>
                <p className="text-sm text-slate-500">
                  Click the "Add Configuration" button to create your first setting.
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}

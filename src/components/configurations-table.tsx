import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, Info, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { organizationsService } from "@/api/services/organizations.service"
import type { Configuration } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ConfigurationsTableProps {
  entityId: string;
  entityType: 'organization' | 'tenant';
}

export function ConfigurationsTable({ entityId, entityType }: ConfigurationsTableProps) {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newConfigs, setNewConfigs] = useState([{ key: "", value: "" }])

  const queryKeyType = entityType === 'organization' ? 'organizations' : 'tenants'

  const { data: configurations = [], isLoading } = useQuery({
    queryKey: [queryKeyType, entityId, 'configurations'],
    queryFn: () => entityType === 'organization'
      ? organizationsService.getConfigurations(entityId)
      : organizationsService.getTenantConfigurations(entityId),
    enabled: !!entityId
  })

  const createMutation = useMutation({
    mutationFn: (payload: { values: Record<string, string> }) => 
      entityType === 'organization'
        ? organizationsService.updateConfigurations(entityId, payload)
        : organizationsService.updateTenantConfigurations(entityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeyType, entityId, 'configurations'] })
      toast.success("Configurations created successfully")
      setIsCreateOpen(false)
      setNewConfigs([{ key: "", value: "" }])
    },
    onError: (error) => {
      toast.error("Failed to create configuration")
      console.error(error)
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validConfigs = newConfigs.filter(c => c.key.trim() && c.value.trim())
    if (validConfigs.length === 0) return
    
    const values = validConfigs.reduce((acc, curr) => {
      acc[curr.key.trim()] = curr.value.trim()
      return acc
    }, {} as Record<string, string>)
    
    createMutation.mutate({ values })
  }

  const columns = useMemo<CustomColumnDef<Configuration>[]>(() => [
    {
      accessorKey: "key",
      header: "Key",
      width: 250,
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-sm">
          {row.original.key}
        </span>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      width: 300,
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.original.value}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      width: 120,
      cell: ({ row }) => (
        <Badge
          variant={row.original.is_active ? "secondary" : "outline"}
          className={
            row.original.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "text-slate-400"
          }
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "is_editable_by_tenant",
      header: "Tenant Editable",
      width: 150,
      cell: ({ row }) => (
        <Badge
          variant={row.original.is_editable_by_tenant ? "secondary" : "outline"}
          className={
            row.original.is_editable_by_tenant
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "text-slate-400"
          }
        >
          {row.original.is_editable_by_tenant ? "Yes" : "No"}
        </Badge>
      ),
    },
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
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 rounded-xl font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" /> Add Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] sm:max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Configuration</DialogTitle>
              <DialogDescription>
                Create new configuration key-value pairs for this {entityType}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-4 max-h-[300px] overflow-y-auto p-1">
                {newConfigs.map((config, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`key-${index}`}>Key</Label>
                      <Input
                        id={`key-${index}`}
                        value={config.key}
                        onChange={(e) => {
                          const updated = [...newConfigs];
                          updated[index].key = e.target.value;
                          setNewConfigs(updated);
                        }}
                        placeholder="e.g. max_users"
                        className="font-mono text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`value-${index}`}>Value</Label>
                      <Input
                        id={`value-${index}`}
                        value={config.value}
                        onChange={(e) => {
                          const updated = [...newConfigs];
                          updated[index].value = e.target.value;
                          setNewConfigs(updated);
                        }}
                        placeholder="e.g. 100"
                        required
                      />
                    </div>
                    {newConfigs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-500 shrink-0"
                        onClick={() => {
                          setNewConfigs(newConfigs.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-dashed"
                onClick={() => setNewConfigs([...newConfigs, { key: "", value: "" }])}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Row
              </Button>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || newConfigs.some(c => !c.key.trim() || !c.value.trim())} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Configurations
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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

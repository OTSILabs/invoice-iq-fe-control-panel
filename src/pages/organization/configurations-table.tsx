import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Info, Plus, Save, X, Eye, EyeOff, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { organizationsService } from "@/api/services/organizations.service"
import type { Configuration } from "@/types"

interface ConfigurationsTableProps {
  entityId: string;
  entityType: 'organization' | 'tenant';
}

function MaskedValue({ value }: { value: string }) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 max-w-[200px]">
      <span className="font-mono text-xs text-muted-foreground truncate">
        {show ? value : "••••••••"}
      </span>
      <button onClick={() => setShow(v => !v)} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <button onClick={handleCopy} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

export function ConfigurationsTable({ entityId, entityType }: ConfigurationsTableProps) {
  const queryClient = useQueryClient()
  const queryKeyType = entityType === 'organization' ? 'organizations' : 'tenants'

  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const { data: configurations = [], isLoading } = useQuery({
    queryKey: [queryKeyType, entityId, 'configurations'],
    queryFn: () => entityType === 'organization'
      ? organizationsService.getConfigurations(entityId)
      : organizationsService.getTenantConfigurations(entityId),
    enabled: !!entityId
  })

  const handleSave = async () => {
    if (!newKey.trim() || !newValue.trim()) return
    setIsSaving(true)
    try {
      const payload = { values: { [newKey.trim()]: newValue.trim() } }
      if (entityType === 'organization') {
        await organizationsService.updateConfigurations(entityId, payload)
      } else {
        await organizationsService.updateTenantConfigurations(entityId, payload)
      }
      queryClient.invalidateQueries({ queryKey: [queryKeyType, entityId, 'configurations'] })
      setNewKey("")
      setNewValue("")
      setIsAdding(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setNewKey("")
    setNewValue("")
    setIsAdding(false)
  }

  const columns = useMemo<CustomColumnDef<Configuration>[]>(() => [
    {
      accessorKey: "key",
      header: "Key",
      width: 150,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-foreground">
          {row.original.key}
        </span>
      )
    },
    {
      accessorKey: "value",
      header: "Value",
      width: 200,
      cell: ({ row }) => <MaskedValue value={String(row.original.value)} />
    },
    {
      accessorKey: "is_active",
      header: "Status",
      width: 100,
      cell: ({ row }) => (
        <Badge
          variant={row.original.is_active ? "secondary" : "outline"}
          className={row.original.is_active
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "text-muted-foreground"}
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      )
    },
  ], [])

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[300px]">
      <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Configuration Settings</h3>
            <p className="text-[12px] text-muted-foreground">Manage settings for this {entityType}.</p>
          </div>
        </div>
        {!isAdding && (
          <Button variant="outline" size="sm" className="text-xs shadow-none" onClick={() => setIsAdding(true)}>
            <Plus className="size-3.5 mr-1.5" /> Add Configuration
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/30">
          <Input
            placeholder="Key"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            className="h-8 text-xs font-mono w-[180px]"
          />
          <Input
            placeholder="Value"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            className="h-8 text-xs w-[180px]"
          />
          <Button size="sm" className="h-8 text-xs shadow-none" onClick={handleSave} disabled={isSaving || !newKey.trim() || !newValue.trim()}>
            <Save className="size-3.5 mr-1.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={handleCancel}>
            <X className="size-3.5 mr-1" /> Cancel
          </Button>
        </div>
      )}

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
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <h3 className="text-sm font-semibold text-foreground">No Configurations Yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Add Configuration" above to create your first setting.
              </p>
            </div>
          }
        />
      </div>
    </div>
  )
}
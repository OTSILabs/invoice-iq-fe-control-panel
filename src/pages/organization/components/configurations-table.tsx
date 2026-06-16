import { useState, useMemo, useCallback } from "react"
import { Info, Plus, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { useEntityConfigurations, useUpdateEntityConfigurations, useConfigurationKeys } from "@/api/hooks/useOrganizations"
import type { Configuration } from "@/types"
import { MaskedValue } from "@/components/ui/copyable-field"
import { toast } from "sonner"
import { NativeSelect } from "@/components/ui/native-select"

interface ConfigurationsTableProps {
  entityId: string
  entityType: 'organization' | 'tenant'
}

interface EditableValueCellProps {
  configKey: string
  initialValue: string
  isSaving: boolean
  isBoolean: boolean
  onValueChange: (key: string, value: string) => void
}

function EditableValueCell({
  configKey,
  initialValue,
  isSaving,
  isBoolean,
  onValueChange
}: EditableValueCellProps) {
  const [localValue, setLocalValue] = useState(initialValue)

  const handleChange = (val: string) => {
    setLocalValue(val)
    onValueChange(configKey, val)
  }

  if (isBoolean) {
    return (
      <NativeSelect
        value={localValue || "false"}
        onChange={(e) => handleChange(e.target.value)}
        className="w-[180px]"
        disabled={isSaving}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </NativeSelect>
    )
  }

  return (
    <Input
      placeholder="Enter value"
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      className="h-8 text-xs w-[180px]"
      disabled={isSaving}
    />
  )
}

export function ConfigurationsTable({ entityId, entityType }: ConfigurationsTableProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newValues, setNewValues] = useState<Record<string, string>>({})

  const { data: configurations = [], isLoading } = useEntityConfigurations(entityId, entityType)
  const { mutateAsync: updateConfig, isPending: isSaving } = useUpdateEntityConfigurations(entityId, entityType)
  const { data: configurationKeys = [] } = useConfigurationKeys()

  const existingKeys = useMemo(() => new Set(configurations.map(c => c.key)), [configurations])

  const apiKeysMetadata = useMemo(() => {
    const metadata: Record<string, { defaultValue: string; isBoolean: boolean; isRequired: boolean; label: string }> = {}
    
    ;(configurationKeys as unknown[]).forEach((item) => {
      const isObj = typeof item === "object" && item !== null
      const obj = item as Record<string, unknown>
      const key = typeof item === "string" ? item : String(obj.key || obj.name || "")
      if (!key) return
      
      // Check scope compatibility
      let isScopeCompatible = true
      const rawScopes = obj.allowed_scopes !== undefined ? obj.allowed_scopes :
                        obj.allowed_scope !== undefined ? obj.allowed_scope :
                        obj.scopes !== undefined ? obj.scopes : null;
      
      if (rawScopes !== null && rawScopes !== undefined) {
        const scopesList = Array.isArray(rawScopes)
          ? rawScopes.map(s => String(s).toLowerCase())
          : [String(rawScopes).toLowerCase()]
        
        if (entityType === "organization") {
          isScopeCompatible = scopesList.some(s => 
            s.includes("organisation") || 
            s.includes("organization") || 
            s.includes("org") || 
            s.includes("both")
          )
        } else if (entityType === "tenant") {
          isScopeCompatible = scopesList.some(s => 
            s.includes("tenant") || 
            s.includes("both")
          )
        }
      }
      
      if (!isScopeCompatible) return
      
      const label = isObj ? String(obj.label || obj.description || key) : key
      const isRequired = isObj ? Boolean(obj.is_required || obj.required) : false
      
      let defaultValue = ""
      if (isObj) {
        const rawDefault = obj.default_value !== undefined ? obj.default_value :
                           obj.defaultValue !== undefined ? obj.defaultValue :
                           obj.default !== undefined ? obj.default : "";
        if (rawDefault !== null && rawDefault !== undefined) {
          defaultValue = String(rawDefault)
        }
      }
      
      let isBoolean = false
      if (isObj) {
        const isBool = (val: unknown): val is boolean => typeof val === "boolean"
        if (isBool(obj.default_value) || isBool(obj.defaultValue) || isBool(obj.default)) {
          isBoolean = true
        } else if (obj.type === "boolean" || obj.value_type === "boolean") {
          isBoolean = true
        } else {
          const rawStr = String(obj.default_value || obj.defaultValue || obj.default || "").toLowerCase()
          if (rawStr === "true" || rawStr === "false") {
            isBoolean = true
          }
        }
      }
      
      metadata[key] = { defaultValue, isBoolean, isRequired, label }
    })
    
    return metadata
  }, [configurationKeys, entityType])

  const newKeysToAdd = useMemo(() => {
    if (!isAdding) return []
    return (configurationKeys as unknown[]).map((item) => {
      const obj = item as Record<string, string>
      const key = typeof item === "string" ? item : (obj.key || obj.name || "")
      const isScopeCompatible = !!apiKeysMetadata[key]
      return isScopeCompatible ? key : ""
    }).filter(k => k && !existingKeys.has(k))
  }, [configurationKeys, existingKeys, isAdding, apiKeysMetadata])

  const handleSave = async () => {
    const payload: Record<string, string> = {}
    const missedFields: string[] = []

    newKeysToAdd.forEach(key => {
      const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key }
      const val = newValues[key] || ""
      
      let finalVal = val.trim()
      
      // Fall back to default value if empty
      if (!finalVal && metadata.defaultValue) {
        finalVal = metadata.defaultValue.trim()
      }
      
      // If still empty, it's considered missed
      if (!finalVal) {
        missedFields.push(metadata.label)
      } else {
        payload[key] = finalVal
      }
    })

    if (missedFields.length > 0) {
      toast.error(`Please fill in all configurations. Missed: ${missedFields.join(", ")}`)
      return
    }

    try {
      await updateConfig(payload)
      toast.success("Configurations updated successfully")
      setNewValues({})
      setIsAdding(false)
    } catch (error: unknown) {
      let errMsg = "Failed to save configurations"
      if (error && typeof error === "object" && "response" in error) {
        const resp = (error as { response: unknown }).response
        if (resp && typeof resp === "object" && "data" in resp) {
          const data = (resp as { data: unknown }).data
          if (data && typeof data === "object" && "message" in data) {
            errMsg = String((data as { message: unknown }).message)
          }
        }
      } else if (error instanceof Error) {
        errMsg = error.message
      }
      toast.error(errMsg)
    }
  }

  const handleCancel = () => {
    setNewValues({})
    setIsAdding(false)
  }

  const handleValueChange = useCallback((key: string, value: string) => {
    setNewValues(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const tableData = useMemo(() => {
    if (isAdding) {
      const newRows = newKeysToAdd.map(key => ({
        key,
        value: newValues[key] || "",
        is_active: true,
        is_editable_by_tenant: true,
        isNewRow: true
      }))
      return [...newRows, ...configurations]
    }
    return configurations
  }, [configurations, isAdding, newKeysToAdd, newValues])

  const columns = useMemo<CustomColumnDef<Configuration>[]>(() => [
    {
      accessorKey: "key",
      header: "Key",
      width: 150,
      cell: ({ row }) => {
        const isNewRow = (row.original as { isNewRow?: boolean }).isNewRow
        if (isNewRow) {
          const key = row.original.key
          const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key }
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs font-semibold text-foreground">{metadata.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{key}</span>
            </div>
          )
        }
        return <span className="font-mono text-xs font-medium text-foreground">{row.original.key}</span>
      }
    },
    {
      accessorKey: "value",
      header: "Value",
      width: 200,
      cell: ({ row }) => {
        const isNewRow = (row.original as { isNewRow?: boolean }).isNewRow
        if (isNewRow) {
          const key = row.original.key
          const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key }
          
          return (
            <EditableValueCell
              configKey={key}
              initialValue={String(row.original.value)}
              isSaving={isSaving}
              isBoolean={metadata.isBoolean}
              onValueChange={handleValueChange}
            />
          )
        }
        return <MaskedValue value={String(row.original.value)} />
      }
    },
    {
      accessorKey: "is_active",
      header: "Status",
      width: 100,
      cell: ({ row }) => {
        const isNewRow = (row.original as { isNewRow?: boolean }).isNewRow
        if (isNewRow) {
          return (
            <Badge variant="secondary" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Active
            </Badge>
          )
        }
        return (
          <Badge variant={row.original.is_active ? "secondary" : "outline"} className={row.original.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "text-muted-foreground"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        )
      }
    },
  ], [isSaving, apiKeysMetadata, handleValueChange])

  const handleAddConfiguration = () => {
    const apiKeysData = (configurationKeys as unknown[]).map((item) => {
      const isObj = typeof item === "object" && item !== null
      const obj = item as Record<string, unknown>
      const key = typeof item === "string" ? item : String(obj.key || obj.name || "")
      
      let defaultValue = ""
      if (isObj) {
        const rawDefault = obj.default_value !== undefined ? obj.default_value :
                           obj.defaultValue !== undefined ? obj.defaultValue :
                           obj.default !== undefined ? obj.default : "";
        if (rawDefault !== null && rawDefault !== undefined) {
          defaultValue = String(rawDefault)
        }
      }
      
      return { key, defaultValue }
    }).filter(item => !!item.key)

    const unconfigured = apiKeysData.filter(item => !existingKeys.has(item.key) && !!apiKeysMetadata[item.key])

    if (unconfigured.length === 0) {
      toast.info("All available configurations have already been set.")
      return
    }

    const initialValues: Record<string, string> = {}
    unconfigured.forEach(item => {
      const metadata = apiKeysMetadata[item.key] || { defaultValue: "", isBoolean: false, isRequired: false, label: item.key }
      initialValues[item.key] = item.defaultValue || (metadata.isBoolean ? "false" : "")
    })

    setNewValues(initialValues)
    setIsAdding(true)
  }

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[300px]">
      {/* Header */}
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
        {!isAdding ? (
          <Button variant="outline" size="sm" className="text-xs shadow-none cursor-pointer" onClick={handleAddConfiguration}>
            <Plus className="size-3.5 mr-1.5" /> Add Configuration
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs shadow-none cursor-pointer" onClick={handleSave} disabled={isSaving}>
              <Save className="size-3.5 mr-1.5" /> {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs cursor-pointer border border-border" onClick={handleCancel}>
              <X className="size-3.5 mr-1" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="relative">
        <DataTable
          data={tableData}
          columns={columns}
          isLoading={isLoading}
          enablePagination
          pageSize={10}
          totalItems={tableData.length}
          stickyHeader
          tableContainerClassName="border-0 rounded-none bg-transparent"
          emptyState={
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <h3 className="text-sm font-semibold text-foreground">No Configurations Yet</h3>
              <p className="text-xs text-muted-foreground mt-1">Click "Add Configuration" above to create your first setting.</p>
            </div>
          }
        />
      </div>
    </div>
  )
}
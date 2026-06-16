import { useState, useMemo, useCallback } from "react"
import { DataTable } from "@/components/ui/data-table"
import { useEntityConfigurations, useUpdateEntityConfigurations, useConfigurationKeys } from "@/api/hooks/useOrganizations"
import { toast } from "sonner"
import { ConfigurationsTableHeader } from "./configurations-table-header"
import { useEntityKeysMetadata } from "./use-entity-keys-metadata"
import { useConfigurationsTableColumns } from "./use-configurations-table-columns"

interface ConfigurationsTableProps {
  entityId: string
  entityType: 'organization' | 'tenant'
}

export function ConfigurationsTable({ entityId, entityType }: ConfigurationsTableProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newValues, setNewValues] = useState<Record<string, string>>({})

  const { data: configurations = [], isLoading } = useEntityConfigurations(entityId, entityType)
  const { mutateAsync: updateConfig, isPending: isSaving } = useUpdateEntityConfigurations(entityId, entityType)
  const { data: configurationKeys = [] } = useConfigurationKeys()

  const existingKeys = useMemo(() => new Set(configurations.map(c => c.key)), [configurations])

  // Extract metadata hook to separate file
  const { apiKeysMetadata, newKeysToAdd } = useEntityKeysMetadata(
    configurationKeys,
    entityType,
    existingKeys,
    isAdding
  )

  const handleSave = async () => {
    const payload: Record<string, string> = {}
    const missedFields: string[] = []

    newKeysToAdd.forEach(key => {
      const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key }
      const val = newValues[key] || ""
      
      let finalVal = val.trim()
      
      if (!finalVal && metadata.defaultValue) {
        finalVal = metadata.defaultValue.trim()
      }
      
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

  // Extract columns configuration into custom hook
  const columns = useConfigurationsTableColumns(isSaving, apiKeysMetadata, handleValueChange)

  const handleAddConfiguration = () => {
    const unconfigured: { key: string; defaultValue: string }[] = []
    
    for (const item of (configurationKeys as unknown[])) {
      const isObj = typeof item === "object" && item !== null
      const obj = item as Record<string, unknown>
      const key = typeof item === "string" ? item : String(obj.key || obj.name || "")
      
      if (key && !existingKeys.has(key) && apiKeysMetadata[key]) {
        let defaultValue = ""
        if (isObj) {
          const rawDefault = obj.default_value !== undefined ? obj.default_value :
                             obj.defaultValue !== undefined ? obj.defaultValue :
                             obj.default !== undefined ? obj.default : "";
          if (rawDefault !== null && rawDefault !== undefined) {
            defaultValue = String(rawDefault)
          }
        }
        unconfigured.push({ key, defaultValue })
      }
    }

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
      <ConfigurationsTableHeader
        entityType={entityType}
        isAdding={isAdding}
        isSaving={isSaving}
        onAdd={handleAddConfiguration}
        onSave={handleSave}
        onCancel={handleCancel}
      />

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
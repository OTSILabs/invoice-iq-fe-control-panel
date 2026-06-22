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
  const [newValues, setNewValues] = useState<Record<string, string>>({})

  const { data: configurations = [], isLoading } = useEntityConfigurations(entityId, entityType)
  const { mutateAsync: updateConfig, isPending: isSaving } = useUpdateEntityConfigurations(entityId, entityType)
  const { data: configurationKeys = [] } = useConfigurationKeys()

  const existingKeys = useMemo(() => new Set(configurations.map(c => c.key)), [configurations])

  // Extract metadata hook to separate file
  const { apiKeysMetadata } = useEntityKeysMetadata(
    configurationKeys,
    entityType,
    existingKeys,
    false
  )

  const compatibleKeys = useMemo(() => {
    return Object.keys(apiKeysMetadata)
  }, [apiKeysMetadata])

  const hasChanges = useMemo(() => {
    return Object.keys(newValues).length > 0
  }, [newValues])

  const handleSave = async () => {
    const payload: Record<string, string> = {}
    const missedFields: string[] = []

    Object.keys(newValues).forEach(key => {
      const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key }
      const val = newValues[key]
      const finalVal = val.trim()

      if (!finalVal) {
        if (metadata.isRequired) {
          missedFields.push(metadata.label)
        } else {
          payload[key] = ""
        }
      } else {
        payload[key] = finalVal
      }
    })

    if (missedFields.length > 0) {
      toast.error(`Please fill in all configurations. Missed: ${missedFields.join(", ")}`)
      return
    }

    if (Object.keys(payload).length === 0) {
      return
    }

    try {
      await updateConfig(payload)
      toast.success("Configurations updated successfully")
      setNewValues({})
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

  const handleValueChange = useCallback((key: string, value: string) => {
    setNewValues(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const tableData = useMemo(() => {
    return compatibleKeys.map(key => {
      const existingConfig = configurations.find(c => c.key === key)
      const value = newValues[key] !== undefined
        ? newValues[key]
        : (existingConfig ? String(existingConfig.value) : "")
        
      return {
        value,
        key,
        dbValue: existingConfig ? String(existingConfig.value) : "",
        is_active: existingConfig ? existingConfig.is_active : true,
        is_editable_by_tenant: existingConfig ? existingConfig.is_editable_by_tenant : true,
        isNewRow: true
      }
    })
  }, [compatibleKeys, configurations, newValues])

  // Extract columns configuration into custom hook
  const columns = useConfigurationsTableColumns(isSaving, apiKeysMetadata, handleValueChange)

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[300px]">
      <ConfigurationsTableHeader
        entityType={entityType}
        isSaving={isSaving}
        hasChanges={hasChanges}
        onSave={handleSave}
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
              <h3 className="text-sm font-semibold text-foreground">No Configurations Available</h3>
              <p className="text-xs text-muted-foreground mt-1">There are no compatible configurations for this {entityType}.</p>
            </div>
          }
        />
      </div>
    </div>
  )
}

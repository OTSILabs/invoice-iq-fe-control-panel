import { useState, useMemo, useCallback } from "react"
import { DataTable } from "@/components/ui/data-table"
import { useEntityProfile, useUpdateEntityProfile, useProfileKeys } from "@/api/hooks/useOrganizations"
import { toast } from "sonner"
import { ProfileTableHeader } from "./profile-table-header"
import { useEntityKeysMetadata } from "./use-entity-keys-metadata"
import { useProfileTableColumns } from "./use-profile-table-columns"

interface ProfileTableProps {
  entityId: string
  entityType: 'organization' | 'tenant'
}

export function ProfileTable({ entityId, entityType }: ProfileTableProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newValues, setNewValues] = useState<Record<string, string>>({})

  const { data: profileEntries = [], isLoading } = useEntityProfile(entityId, entityType)
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateEntityProfile(entityId, entityType)
  const { data: profileKeys = [] } = useProfileKeys()

  const existingKeys = useMemo(() => {
    const set = new Set<string>()
    profileEntries.forEach(c => {
      const val = String(c.value || "").trim()
      if (val && val !== "Not Configured") {
        set.add(c.key)
      }
    })
    return set
  }, [profileEntries])

  const activeProfileEntries = useMemo(() => {
    return profileEntries.filter(c => {
      const val = String(c.value || "").trim()
      return val && val !== "Not Configured"
    })
  }, [profileEntries])

  // Extract metadata parsing logic into custom hook
  const { apiKeysMetadata, newKeysToAdd } = useEntityKeysMetadata(
    profileKeys,
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
      
      if (!finalVal && metadata.isRequired) {
        missedFields.push(metadata.label)
      } else if (finalVal) {
        payload[key] = finalVal
      }
    })

    if (missedFields.length > 0) {
      toast.error(`Please fill in required fields. Missed: ${missedFields.join(", ")}`)
      return
    }

    try {
      await updateProfile(payload)
      toast.success("Profile updated successfully")
      setNewValues({})
      setIsAdding(false)
    } catch (error: unknown) {
      let errMsg = "Failed to save profile"
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
        is_tenant_editable: true,
        is_visible_to_tenant: true,
        isNewRow: true
      }))
      return [...newRows, ...activeProfileEntries]
    }
    return activeProfileEntries
  }, [activeProfileEntries, isAdding, newKeysToAdd, newValues])

  // Extract columns configuration into custom hook
  const columns = useProfileTableColumns(isSaving, apiKeysMetadata, handleValueChange)

  const handleAddProfile = () => {
    const unconfigured = (profileKeys as unknown[]).reduce<{ key: string; defaultValue: string }[]>((acc, item) => {
      const isObj = typeof item === "object" && item !== null
      const obj = item as Record<string, unknown>
      const key = typeof item === "string" ? item : String(obj.key || obj.name || "")
      
      if (key && !existingKeys.has(key) && !!apiKeysMetadata[key]) {
        let defaultValue = ""
        if (isObj) {
          const rawDefault = obj.default_value !== undefined ? obj.default_value :
                             obj.defaultValue !== undefined ? obj.defaultValue :
                             obj.default !== undefined ? obj.default : "";
          if (rawDefault !== null && rawDefault !== undefined) {
            defaultValue = String(rawDefault)
          }
        }
        acc.push({ key, defaultValue })
      }
      return acc
    }, [])

    if (unconfigured.length === 0) {
      toast.info("All available profile settings have already been set.")
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
      <ProfileTableHeader
        entityType={entityType}
        isAdding={isAdding}
        isSaving={isSaving}
        onAdd={handleAddProfile}
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
              <h3 className="text-sm font-semibold text-foreground">No Profile Settings Yet</h3>
              <p className="text-xs text-muted-foreground mt-1">Click "Add Profile" above to configure your first setting.</p>
            </div>
          }
        />
      </div>
    </div>
  )
}

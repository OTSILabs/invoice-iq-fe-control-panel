import type { ProfileTableProps } from "@/types";
import { useState, useMemo, useCallback } from "react"
import { DataTable } from "@/components/ui/data-table"
import { useEntityProfile, useUpdateEntityProfile, useProfileKeys } from "@/api/hooks/useOrganizations"
import { toast } from "sonner"
import { ProfileTableHeader } from "./profile-table-header"
import { useEntityKeysMetadata } from "./use-entity-keys-metadata"
import { getProfileColumns } from "@/columns"



export function ProfileTable({ entityId, entityType }: ProfileTableProps) {
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

  // Extract metadata parsing logic into custom hook
  const { apiKeysMetadata } = useEntityKeysMetadata(
    profileKeys,
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
      toast.error(`Please fill in required fields. Missed: ${missedFields.join(", ")}`)
      return
    }

    if (Object.keys(payload).length === 0) {
      return
    }

    try {
      await updateProfile(payload)
      toast.success("Profile updated successfully")
      setNewValues({})
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

  const handleValueChange = useCallback((key: string, value: string) => {
    setNewValues(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const tableData = useMemo(() => {
    return compatibleKeys.map(key => {
      const existingEntry = profileEntries.find(c => c.key === key)
      const value = newValues[key] !== undefined
        ? newValues[key]
        : (existingEntry && existingEntry.value !== "Not Configured" ? String(existingEntry.value) : "")

      return {
        key,
        value,
        dbValue: existingEntry && existingEntry.value !== "Not Configured" ? String(existingEntry.value) : "",
        is_active: existingEntry ? existingEntry.is_active : true,
        is_tenant_editable: existingEntry ? existingEntry.is_tenant_editable : true,
        is_visible_to_tenant: existingEntry ? existingEntry.is_visible_to_tenant : true,
        isNewRow: true
      }
    })
  }, [compatibleKeys, profileEntries, newValues])

  const columns = useMemo(() => getProfileColumns(isSaving, apiKeysMetadata, handleValueChange), [isSaving, apiKeysMetadata, handleValueChange])

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[300px]">
      <ProfileTableHeader
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
              <h3 className="text-sm font-semibold text-foreground">No Profile Settings Available</h3>
              <p className="text-xs text-muted-foreground mt-1">There are no compatible profile settings for this {entityType}.</p>
            </div>
          }
        />
      </div>
    </div>
  )
}

import { useState, useMemo, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { useEntityProfile, useUpdateEntityProfile, useProfileKeys } from "@/api/hooks/useOrganizations"
import type { ProfileEntry } from "@/types"
import { toast } from "sonner"
import { EditableValueCell } from "./profile-editable-value-cell"
import { ProfileTableHeader } from "./profile-table-header"

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

  const apiKeysMetadata = useMemo(() => {
    const metadata: Record<string, { defaultValue: string; isBoolean: boolean; isRequired: boolean; label: string }> = {}
    
    ;(profileKeys as unknown[]).forEach((item) => {
      const isObj = typeof item === "object" && item !== null
      const obj = item as Record<string, unknown>
      const key = typeof item === "string" ? item : String(obj.key || obj.name || "")
      if (!key) return
      
      // Check scope compatibility
      let isScopeCompatible = true
      const appliesTo = obj.applies_to !== undefined ? String(obj.applies_to).toLowerCase() : ""
      
      if (appliesTo) {
        if (entityType === "organization") {
          isScopeCompatible = appliesTo === "organisation" || appliesTo === "organization" || appliesTo === "both"
        } else if (entityType === "tenant") {
          isScopeCompatible = appliesTo === "tenant" || appliesTo === "tent" || appliesTo === "both"
        }
      } else {
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
  }, [profileKeys, entityType])

  const newKeysToAdd = useMemo(() => {
    if (!isAdding) return []
    return (profileKeys as unknown[]).reduce<string[]>((acc, item) => {
      const obj = item as Record<string, string>
      const key = typeof item === "string" ? item : (obj.key || obj.name || "")
      const isScopeCompatible = !!apiKeysMetadata[key]
      if (isScopeCompatible && key && !existingKeys.has(key)) {
        acc.push(key)
      }
      return acc
    }, [])
  }, [profileKeys, existingKeys, isAdding, apiKeysMetadata])

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

  const columns = useMemo<CustomColumnDef<ProfileEntry>[]>(() => [
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
              value={String(row.original.value)}
              isSaving={isSaving}
              isBoolean={metadata.isBoolean}
              onValueChange={handleValueChange}
            />
          )
        }
        return <span className="text-xs font-medium text-foreground">{String(row.original.value)}</span>
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

import { useMemo } from "react"
import type { CustomColumnDef } from "@/components/ui/data-table"
import type { ProfileEntry } from "@/types"
import { EditableValueCell } from "./profile-editable-value-cell"
import type { EntityKeyMetadata } from "./use-entity-keys-metadata"

export function useProfileTableColumns(
  isSaving: boolean,
  apiKeysMetadata: Record<string, EntityKeyMetadata>,
  handleValueChange: (key: string, value: string) => void
) {
  return useMemo<CustomColumnDef<ProfileEntry>[]>(() => [
    {
      accessorKey: "key",
      header: "Key",
      width: 150,
      cell: ({ row }) => (
        <span className="text-xs text-foreground">
          {row.original.key}
        </span>
      )
    },
    {
      id: "label",
      header: "Label",
      width: 150,
      cell: ({ row }) => {
        const key = row.original.key
        const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key, description: "" }
        return (
          <span className="text-xs text-foreground">
            {metadata.label}
          </span>
        )
      }
    },
    {
      accessorKey: "value",
      header: "Value",
      width: 200,
      cell: ({ row }) => {
        const key = row.original.key
        const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key, description: "" }
        
        return (
          <EditableValueCell
            key={`${key}-${(row.original as { dbValue?: string }).dbValue || ""}`}
            configKey={key}
            initialValue={String(row.original.value)}
            isSaving={isSaving}
            isBoolean={metadata.isBoolean}
            referenceKey={metadata.referenceKey}
            onValueChange={handleValueChange}
          />
        )
      }
    },
  ], [isSaving, apiKeysMetadata, handleValueChange])
}

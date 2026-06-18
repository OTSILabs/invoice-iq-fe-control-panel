import { useMemo } from "react"
import { Link } from "react-router-dom"
import type { CustomColumnDef } from "@/components/ui/data-table"
import type { Configuration } from "@/types"
import { MaskedValue } from "@/components/ui/copyable-field"
import { EditableValueCell } from "./editable-value-cell"
import type { EntityKeyMetadata } from "./use-entity-keys-metadata"

export function useConfigurationsTableColumns(
  isSaving: boolean,
  apiKeysMetadata: Record<string, EntityKeyMetadata>,
  handleValueChange: (key: string, value: string) => void
) {
  return useMemo<CustomColumnDef<Configuration>[]>(() => [
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
      accessorKey: "key",
      header: "Key",
      width: 150,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground">
          {row.original.key}
        </span>
      )
    },
   
    {
      accessorKey: "value",
      header: "Value",
      width: 200,
      cell: ({ row }) => {
        const isNewRow = (row.original as { isNewRow?: boolean }).isNewRow
        const key = row.original.key
        const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key, description: "" }
        
        if (isNewRow) {
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
        
        if (metadata.referenceKey && row.original.value) {
          return (
            <div className="flex items-center">
              <Link
                to={`/platform-standard-content/reference-lists/${metadata.referenceKey}/${row.original.value}`}
                className="font-mono text-xs font-semibold text-foreground hover:underline bg-muted/50 hover:bg-muted px-2 py-0.5 rounded border border-border transition-colors cursor-pointer text-left"
                title="Click to view reference item details"
              >
                {String(row.original.value)}
              </Link>
            </div>
          )
        }
        
        return <MaskedValue value={String(row.original.value)} />
      }
    },
  ], [isSaving, apiKeysMetadata, handleValueChange])
}

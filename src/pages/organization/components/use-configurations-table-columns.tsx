import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
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
        const key = row.original.key
        const metadata = apiKeysMetadata[key] || { defaultValue: "", isBoolean: false, isRequired: false, label: key }
        
        if (isNewRow) {
          return (
            <EditableValueCell
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
}

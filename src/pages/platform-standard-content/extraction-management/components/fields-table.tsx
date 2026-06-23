import { SearchInput } from "@/components/search-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"
import type { FieldsTableProps, StandardExtractionFieldResponse } from "@/types"
import { Edit2, RefreshCw } from "lucide-react"
import { useMemo } from "react"

export function FieldsTable({
  data,
  isLoading,
  isFetching,
  onEdit,
  searchText,
  onSearchChange,
  onRefresh,
}: FieldsTableProps) {
  const columns = useMemo<CustomColumnDef<StandardExtractionFieldResponse>[]>(
    () => [
      {
        accessorKey: "field_id",
        header: "Field ID",
        width: "20%",
        minWidth: "120px",
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-foreground truncate block">{row.original.field_id}</span>,
      },
      {
        accessorKey: "field_label",
        header: "Label",
        width: "20%",
        minWidth: "130px",
        cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.field_label}</span>,
      },
      {
        accessorKey: "data_type_code",
        header: "Type",
        width: "120px",
        minWidth: "100px",
        cell: ({ row }) => <Badge variant="outline" className="text-[10px] uppercase font-bold">{row.original.data_type_code}</Badge>,
      },
      {
        accessorKey: "field_category_code",
        header: "Category",
        width: "150px",
        minWidth: "120px",
        cell: ({ row }) => <span className="text-xs text-muted-foreground truncate block">{row.original.field_category_code}</span>,
      },
      {
        accessorKey: "header_item",
        header: "Scope",
        width: "100px",
        minWidth: "80px",
        cell: ({ row }) => {
          const isHeader = row.original.header_item === "header";
          return (
            <Badge variant={isHeader ? "secondary" : "outline"} className={cn("text-[9px] font-semibold px-2 py-0.5 capitalize", isHeader ? "bg-slate-50 text-slate-700 border-slate-200" : "bg-blue-50/50 text-blue-700 border-blue-200")}>
              {row.original.header_item}
            </Badge>
          );
        },
      },
      {
        accessorKey: "allowed_value_mode",
        header: "Value Mode",
        width: "130px",
        minWidth: "110px",
        cell: ({ row }) => <span className="text-xs text-muted-foreground capitalize">{row.original.allowed_value_mode.replace("_", " ")}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        width: "80px",
        minWidth: "80px",
        cell: ({ row }) => (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer" onClick={() => onEdit(row.original)}>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <div className="rounded-xl border border-border p-0 overflow-hidden">
      <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground">
          Extraction Fields ({data.length})
        </h3>
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchText}
            onChange={onSearchChange}
            disabled={isLoading}
            placeholder="Search fields..."
            className="w-full sm:w-64"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="h-9 w-9 shrink-0 cursor-pointer"
            disabled={isFetching}
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>
      <CardContent className="p-0">
        <DataTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          enablePagination
          pageSize={10}
          totalItems={data.length}
          stickyHeader
          fillAvailableHeight
          tableContainerClassName="border-0 rounded-none bg-transparent"
        />
      </CardContent>
    </div>
  );
}

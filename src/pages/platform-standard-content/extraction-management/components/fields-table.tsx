import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { FilterBar } from "@/components/invoice-ui/design-system"
import { cn } from "@/lib/utils"
import type { FieldsTableProps } from "@/types"
import { RefreshCw } from "lucide-react"
import { useMemo } from "react"
import { getFieldsTableColumns } from "@/columns-data"

export function FieldsTable({
  data,
  isLoading,
  isFetching,
  onEdit,
  searchText,
  onSearchChange,
  onRefresh,
  onView,
}: FieldsTableProps & { onView?: (field: any) => void }) {
  const columns = useMemo(
    () => getFieldsTableColumns(onEdit, onView),
    [onEdit, onView]
  )

  return (
    <div className="table-container overflow-visible">
      <div className="flex min-h-0 flex-1 flex-col p-0">
        <FilterBar className="border-b bg-muted/10 px-4 py-3">
          <h3 className="text-xs font-semibold text-muted-foreground">
            Extraction Fields ({data.length})
          </h3>
          <div className="mt-3 flex w-full flex-col gap-2 sm:mt-0 sm:w-auto sm:flex-row sm:items-center">
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
              className="h-9 w-9 shrink-0 "
              disabled={isFetching}
            >
              <RefreshCw
                className={cn("size-4", isFetching && "animate-spin")}
              />
            </Button>
          </div>
        </FilterBar>
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
          onRowClick={onView}
        />
      </div>
    </div>
  )
}

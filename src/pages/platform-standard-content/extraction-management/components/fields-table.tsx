import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { FilterBar } from "@/components/invoice-ui/design-system"
import { cn } from "@/lib/utils"
import type { FieldsTableProps } from "@/types"
import { RefreshCw } from "lucide-react"
import { useMemo } from "react"
import { getFieldsTableColumns } from "@/columns"

export function FieldsTable({
  data,
  isLoading,
  isFetching,
  onEdit,
  searchText,
  onSearchChange,
  onRefresh,
}: FieldsTableProps) {
  const columns = useMemo(() => getFieldsTableColumns(onEdit), [onEdit]);

  return (
    <div className="table-container">
      <FilterBar>
        <h3 className="text-xs font-semibold text-muted-foreground ">
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
      </FilterBar>
      <div className="p-0">
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
      </div>
    </div>
  );
}

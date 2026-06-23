import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"
import type { DerivedTableProps } from "@/types"
import { RefreshCw } from "lucide-react"
import { useMemo } from "react"
import { getDerivedTableColumns } from "@/columns"

export function DerivedTable({
  data,
  isLoading,
  isFetching,
  onDelete,
  searchText,
  onSearchChange,
  onRefresh,
}: DerivedTableProps) {
  const columns = useMemo(() => getDerivedTableColumns(onDelete), [onDelete]);

  return (
    <div className="rounded-xl border border-border p-0 overflow-hidden">
      <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground ">
          Derived Templates ({data.length})
        </h3>
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchText}
            onChange={onSearchChange}
            disabled={isLoading}
            placeholder="Search derived templates..."
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

import { useState, useMemo } from "react"
import { Database, Plus, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/search-input"
import { useDataTypes } from "@/api/hooks/data-types"
import type { DataType } from "@/types"
import { DataTypeDialog } from "./modals/data-type-dialog"
import { cn } from "@/lib/utils"
import { getDataTypeColumns } from "@/columns"
import { FilterBar, PageShell } from "@/components/invoice-ui/design-system"

export function DataTypes() {
  const navigate = useNavigate()
  const {
    data: dataTypes = [],
    isLoading,
    refetch,
    isFetching,
  } = useDataTypes()
  const [searchText, setSearchText] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editingDataType, setEditingDataType] = useState<DataType | null>(null)

  const handleRefetch = async () => {
    try {
      await refetch()
      toast.success("Data types refreshed")
    } catch {
      toast.error("Failed to refresh data types")
    }
  }

  const columns = useMemo(() => getDataTypeColumns(navigate, setEditingDataType), [navigate])

  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    if (!q) return dataTypes
    return dataTypes.filter(
      (item) =>
        item.data_type_code.toLowerCase().includes(q) ||
        item.display_label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    )
  }, [dataTypes, searchText])

  return (
    <PageShell>
      <PageHeader
        title="Data Types"
        description="Configure and manage platform standard data types for fields."
      >
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="w-full gap-1.5 px-3 sm:w-auto"
        >
          <Plus className="size-4" /> Create Data Type
        </Button>
      </PageHeader>

      <div className="table-container">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar>
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Standard Data Types ({filteredData.length})
            </h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={searchText}
                onChange={setSearchText}
                disabled={isLoading}
                placeholder="Search data types..."
                className="w-full sm:w-72"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                className="size-9 cursor-pointer"
                disabled={isFetching}
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
              </Button>
            </div>
          </FilterBar>

          <DataTable
            data={filteredData}
            columns={columns}
            isLoading={isLoading || isFetching}
            enablePagination
            pageSize={10}
            totalItems={filteredData.length}
            stickyHeader
            tableContainerClassName="border-0 rounded-none bg-transparent"
            onRowClick={(dataType) => navigate(`/platform-standard-content/data-types/${dataType.data_type_code}`)}
            emptyState={
              <div className="flex animate-in flex-col items-center justify-center px-4 py-16 text-center duration-300 fade-in slide-in-from-bottom-2">
                <div className="mb-3 rounded-full border border-primary/10 bg-primary/5 p-4 text-primary/80">
                  <Database className="size-8 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {searchText
                    ? "No data types match filters"
                    : "No standard data types"}
                </h3>
                <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  {searchText
                    ? "We couldn't find any data types matching your search term. Try adjusting your search query."
                    : "Create your first platform standard data type to manage field formats."}
                </p>
                {!searchText && dataTypes.length === 0 && (
                  <Button
                    onClick={() => setCreateOpen(true)}
                    className="mt-4 cursor-pointer gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold"
                  >
                    <Plus className="size-3.5" /> Create Data Type
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </div>

      {(createOpen || !!editingDataType) && (
        <DataTypeDialog
          open={createOpen || !!editingDataType}
          dataType={editingDataType}
          onOpenChange={(open) => {
            if (!open) {
              setCreateOpen(false)
              setEditingDataType(null)
            }
          }}
        />
      )}
    </PageShell>
  )
}

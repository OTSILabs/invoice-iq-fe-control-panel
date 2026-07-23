import { PageMetadata } from "@/components/layout/PageMetadata"
import { useState, useMemo } from "react"
import type { DataType } from "@/types"
import { Database, Plus, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/ui/search-input"
import { useDataTypes } from "@/api/hooks/usedata-types"
import { cn } from "@/lib/utils"
import { getDataTypeColumns } from "@/columns-data"
import { EmptyState, FilterBar, PageShell } from "@/components/invoice-ui/design-system"

export function DataTypes() {
  const navigate = useNavigate()
  const {
    data: dataTypes = [],
    isLoading,
    refetch,
    isFetching,
  } = useDataTypes()
  const [searchText, setSearchText] = useState("")

  const handleRefetch = async () => {
    try {
      await refetch()
      toast.success("Data types refreshed")
    } catch {
      toast.error("Failed to refresh data types")
    }
  }

  const columns = useMemo(() => getDataTypeColumns(navigate, (dataType: DataType) => navigate(`/platform-standard-content/data-types/${dataType.data_type_code}/edit`)), [navigate])

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
      <PageMetadata title="Data Types" description="Configure standard data types and format mappings for extraction templates." keywords="data types, format mapping, platform content" />
      <PageHeader
        title="Data Types"
        description="Configure and manage platform standard data types for fields."
      >
        <Button
          size="sm"
          onClick={() => navigate("/platform-standard-content/data-types/create")}
          className="w-full gap-1.5 px-3 sm:w-auto"
          disabled={isFetching}
        >
          <Plus className="size-4" /> Create Data Type
        </Button>
      </PageHeader>

      <div className="table-container">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar>
            <h3 className="text-xs font-semibold  text-muted-foreground ">
              Standard Data Types ({filteredData.length})
            </h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={searchText}
                onChange={setSearchText}
                disabled={isFetching}
                placeholder="Search data types..."
                className="w-full sm:w-72"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                className="size-9 "
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
              <EmptyState
                icon={Database}
                title={searchText ? "No data types match filters" : "No standard data types"}
                description={
                  searchText
                    ? "We couldn't find any data types matching your search term. Try adjusting your search query."
                    : "Create your first platform standard data type to manage field formats."
                }
                className="min-h-0 border-0 bg-transparent py-10"
                actions={!searchText && dataTypes.length === 0 ? (
                  <Button
                    onClick={() => navigate("/platform-standard-content/data-types/create")}
                    className=" gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold"
                    disabled={isFetching}
                  >
                    <Plus className="size-3.5" /> Create Data Type
                  </Button>
                ) : undefined}
              />
            }
          />
        </div>
      </div>
    </PageShell>
  )
}
import { useState, useMemo } from "react"
import { Database, Plus, RefreshCw, MoreVertical, Edit, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { SearchInput } from "@/components/search-input"
import { useDataTypes } from "@/api/hooks/data-types"
import type { DataType } from "@/types"
import { DataTypeDialog } from "./modals/data-type-dialog"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  const columns = useMemo<CustomColumnDef<DataType>[]>(
    () => [
      {
        accessorKey: "data_type_code",
        header: "Code",
        width: 130,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground">
            {row.original.data_type_code}
          </span>
        ),
      },
      {
        accessorKey: "display_label",
        header: "Display Label",
        width: 130,
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.display_label}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        width: 180,
        rowClassName: "hidden md:table-cell",
        cell: ({ row }) => (
          <span
            className="block max-w-[170px] truncate text-xs text-muted-foreground"
            title={row.original.description}
          >
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "sample_value",
        header: "Sample Value",
        width: 120,
        rowClassName: "hidden lg:table-cell",
        cell: ({ row }) => (
          <span className="block max-w-[110px] truncate font-mono text-xs text-muted-foreground">
            {row.original.sample_value || "—"}
          </span>
        ),
      },
      {
        accessorKey: "sort_sequence",
        header: "Sort Sequence",
        width: 60,
        rowClassName: "hidden lg:table-cell",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            {row.original.sort_sequence ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        width: 100,
        rowClassName: "hidden md:table-cell",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.created_at
              ? new Date(row.original.created_at).toLocaleDateString()
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Action",
        width: 60,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 cursor-pointer p-0"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                className="cursor-pointer text-xs"
                onClick={() => navigate(`/platform-standard-content/data-types/${row.original.data_type_code}`)}
              >
                <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-xs"
                onClick={() => setEditingDataType(row.original)}
              >
                <Edit className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [navigate]
  )

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
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
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

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-border p-0">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
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
                onClick={() => refetch()}
                className="size-9 cursor-pointer"
                disabled={isFetching}
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredData}
            columns={columns}
            isLoading={isLoading}
            enablePagination
            pageSize={10}
            totalItems={filteredData.length}
            stickyHeader
            tableContainerClassName="border-0 rounded-none bg-transparent"
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
        </CardContent>
      </Card>

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
    </div>
  )
}

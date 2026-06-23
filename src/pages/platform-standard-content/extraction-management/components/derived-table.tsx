import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { DerivedTableProps, StandardDerivedTemplateResponse } from "@/types"
import { Edit2, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router-dom"

export function DerivedTable({
  data,
  isLoading,
  isFetching,
  onDelete,
  searchText,
  onSearchChange,
  onRefresh,
}: DerivedTableProps) {
  const columns = useMemo<CustomColumnDef<StandardDerivedTemplateResponse>[]>(
    () => [
      {
        accessorKey: "derived_template_id",
        header: "Derived ID",
        width: "25%",
        minWidth: "140px",
        cell: ({ row }) => <span className=" text-xs font-semibold text-foreground truncate block">{row.original.derived_template_id}</span>,
      },
      {
        accessorKey: "template_id",
        header: "Base Template ID",
        width: "20%",
        minWidth: "120px",
        cell: ({ row }) => <span className=" text-xs text-muted-foreground truncate block">{row.original.template_id}</span>,
      },
      {
        accessorKey: "name",
        header: "Name",
        width: "25%",
        minWidth: "150px",
        cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.name}</span>,
      },
      {
        accessorKey: "description",
        header: "Description",
        width: "25%",
        minWidth: "200px",
        cell: ({ row }) => <span className="text-xs text-muted-foreground truncate block max-w-[300px]">{row.original.description || "—"}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        width: "100px",
        minWidth: "100px",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                  <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-45">
                <DropdownMenuItem asChild className="text-xs cursor-pointer">
                  <Link to={`/platform-standard-content/extraction-management/derived/${row.original.derived_template_id}/edit`}>
                    <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-red-600 cursor-pointer focus:text-red-700" onClick={() => onDelete(row.original.derived_template_id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onDelete]
  );

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

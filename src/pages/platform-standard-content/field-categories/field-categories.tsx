import { useState, useMemo } from "react"
import { Loader2, AlertCircle, RefreshCw, Edit2, MoreVertical, Plus, Tags, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { CustomColumnDef } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/search-input"
import { useFieldCategories } from "@/api/hooks/useFieldCategories"
import type { FieldCategoryResponse } from "@/types"
import { CategoryDialog } from "./models/CategoryDialog"

export function FieldCategories() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading, isError, refetch, isFetching } = useFieldCategories()
  const [searchText, setSearchText] = useState("")
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category: FieldCategoryResponse | null;
  }>({
    open: false,
    mode: "create",
    category: null,
  })

  const handleOpenCreate = () => {
    setDialogState({ open: true, mode: "create", category: null })
  }

  const handleOpenEdit = (category: FieldCategoryResponse) => {
    setDialogState({ open: true, mode: "edit", category })
  }

  const handleRefetch = async () => {
    await refetch()
    toast.success("Field categories refreshed")
  }

  const filteredCategories = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return categories.filter((c) => {
      return !q || [c.field_category_code, c.ui_label, c.description].some((v) => v && v.toLowerCase().includes(q))
    })
  }, [categories, searchText])

  const columns = useMemo<CustomColumnDef<FieldCategoryResponse>[]>(
    () => [
      {
        accessorKey: "field_category_code",
        header: "Category Code",
        width: "25%",
        minWidth: "150px",
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-foreground/80">{row.original.field_category_code}</span>,
      },
      {
        accessorKey: "ui_label",
        header: "UI Label",
        width: "25%",
        minWidth: "150px",
        cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.ui_label}</span>,
      },
      {
        accessorKey: "description",
        header: "Description",
        width: "50%",
        minWidth: "250px",
        cell: ({ row }) => (
          <span className="block truncate text-xs text-muted-foreground max-w-[450px]" title={row.original.description}>
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "example_fields",
        header: "Fields",
        width: "100px",
        minWidth: "90px",
        maxWidth: "110px",
        cell: ({ row }) => {
          const count = row.original.example_fields?.length || 0
          return (
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5 font-semibold bg-muted text-muted-foreground hover:bg-muted">
              {count} {count === 1 ? "Field" : "Fields"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "sort_sequence",
        header: "Sort",
        width: "80px",
        minWidth: "70px",
        maxWidth: "80px",
        cell: ({ row }) => <span className="text-xs text-muted-foreground font-semibold">{row.original.sort_sequence}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        width: "80px",
        minWidth: "80px",
        maxWidth: "80px",
        cell: ({ row }) => (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-45">
                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => navigate(`/platform-standard-content/field-categories/${row.original.field_category_code}`)}>
                  <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => handleOpenEdit(row.original)}>
                  <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate]
  )

  if (isLoading) return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="font-medium text-muted-foreground">Loading field categories...</p>
    </div>
  )

  if (isError) return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Failed to load field categories</h2>
        <p className="mt-1 text-muted-foreground">There was a connection issue. Please check your network and API config.</p>
      </div>
      <Button onClick={handleRefetch} variant="outline" className="gap-2" disabled={isFetching}>
        <RefreshCw className="h-4 w-4" /> Try Again
      </Button>
    </div>
  )

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-200 fade-in">
      <PageHeader
        title="Field Categories"
        description="Organize document and invoice fields into standard categorizations."
      >
        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="w-full sm:w-auto font-medium px-3 shadow-none gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
          disabled={isFetching}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </PageHeader>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-border p-0">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full justify-end">
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
                disabled={isFetching} 
                placeholder="Search categories..." 
                className="w-full sm:w-72"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                className="h-9 w-9 cursor-pointer shrink-0 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px"
                disabled={isFetching}
              >
                <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredCategories}
            columns={columns}
            isLoading={isLoading || isFetching}
            enablePagination
            pageSize={10}
            totalItems={filteredCategories.length}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
            onRowClick={(category) => navigate(`/platform-standard-content/field-categories/${category.field_category_code}`)}
            emptyState={
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-primary/5 p-4 rounded-full mb-3 text-primary/80 border border-primary/10">
                  <Tags className="size-8 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {searchText
                    ? "No field categories match filters"
                    : "No field categories"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                  {searchText
                    ? "We couldn't find any field categories matching your search. Try adjusting your search query."
                    : "Create a new field category to categorize standard document fields."}
                </p>
                {categories.length === 0 && (
                  <Button
                    onClick={handleOpenCreate}
                    className="mt-4 gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
                    disabled={isFetching}
                  >
                    <Plus className="size-3.5" /> Add Category
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>

      {dialogState.open && (dialogState.mode === "create" || dialogState.mode === "edit") && (
        <CategoryDialog
          key={dialogState.category ? `edit-${dialogState.category.field_category_code}` : "create"}
          open={dialogState.open}
          onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
          category={dialogState.category}
        />
      )}
    </div>
  )
}

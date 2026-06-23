import { useState, useMemo } from "react"
import { Loader2, AlertCircle, RefreshCw, Plus, Tags } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"

import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/search-input"
import { useFieldCategories } from "@/api/hooks/useFieldCategories"
import { getFieldCategoriesColumns } from "@/columns"
import { FilterBar, PageShell } from "@/components/invoice-ui/design-system"

export function FieldCategories() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading, isError, refetch, isFetching } = useFieldCategories()
  const [searchText, setSearchText] = useState("")
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

  const columns = useMemo(() => getFieldCategoriesColumns(navigate, (category) => navigate(`/platform-standard-content/field-categories/${category.field_category_code}/edit`)), [navigate])

  if (isLoading) return (
    <PageShell className="min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="font-medium text-muted-foreground">Loading field categories...</p>
    </PageShell>
  )

  if (isError) return (
    <PageShell className="min-h-[60vh] max-w-md items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Failed to load field categories</h2>
        <p className="mt-1 text-muted-foreground">There was a connection issue. Please check your network and API config.</p>
      </div>
      <Button onClick={handleRefetch} variant="outline" className="gap-2" disabled={isFetching}>
        <RefreshCw className="h-4 w-4" /> Try Again
      </Button>
    </PageShell>
  )

  return (
    <PageShell>
      <PageHeader
        title="Field Categories"
        description="Organize document and invoice fields into standard categorizations."
      >
        <Button
          size="sm"
          onClick={() => navigate("/platform-standard-content/field-categories/create")}
          className="w-full sm:w-auto font-medium px-3 shadow-none gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
          disabled={isFetching}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </PageHeader>

      <div className="table-container">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar>
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
          </FilterBar>

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
                    onClick={() => navigate("/platform-standard-content/field-categories/create")}
                    className="mt-4 gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
                    disabled={isFetching}
                  >
                    <Plus className="size-3.5" /> Add Category
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </div>
    </PageShell>
  )
}

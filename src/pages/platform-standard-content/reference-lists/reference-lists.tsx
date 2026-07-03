import { PageMetadata } from "@/components/layout/PageMetadata"
import { useState, useMemo } from "react"
import { Loader2, AlertCircle, RefreshCw, Plus, ListChecks } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"

import { PageHeader } from "@/components/layout/PageHeader"
import { SearchInput } from "@/components/search-input"
import { useReferenceLists, useReferenceListPublications } from "@/api/hooks/useReferenceLists"
import { getReferenceListsColumns } from "@/columns"
import { EmptyState, FilterBar, PageShell } from "@/components/invoice-ui/design-system"

export function ReferenceLists() {
  const navigate = useNavigate()
  const { data: registries = [], isLoading, isError, refetch, isFetching } = useReferenceLists()
  const { data: publications } = useReferenceListPublications()

  if (publications && publications.length > 0) {
    console.debug("Active reference list publications available:", publications.length)
  }

  const [searchText, setSearchText] = useState("")

  const handleRefetch = async () => {
    try {
      await refetch()
      toast.success("Reference lists refreshed")
    } catch {
      toast.error("Failed to refresh reference lists")
    }
  }

  const filteredRegistries = useMemo(() => {
    if (!searchText.trim()) return registries
    const query = searchText.toLowerCase()
    return registries.filter(
      (r) =>
        r.registry_key.toLowerCase().includes(query) ||
        r.display_label.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query))
    )
  }, [registries, searchText])

  const columns = useMemo(
    () => getReferenceListsColumns(navigate, (registry) => navigate(`/platform-standard-content/reference-lists/${registry.registry_key}/edit`)),
    [navigate]
  )

  if (isLoading) return (
    <PageShell className="min-h-[60vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="font-medium text-muted-foreground">Loading reference lists...</p>
    </PageShell>
  )

  if (isError) return (
    <PageShell className="min-h-[60vh] max-w-md items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Failed to load reference lists</h2>
        <p className="mt-1 text-muted-foreground">There was a connection issue. Please check your network and API config.</p>
      </div>
      <Button onClick={handleRefetch} variant="outline" className="gap-2" disabled={isFetching}>
        <RefreshCw className="h-4 w-4" /> Try Again
      </Button>
    </PageShell>
  )

  return (
    <PageShell>
      <PageMetadata title="Reference Lists" description="Configure reference lists and validation lookups for extracted values." keywords="reference lists, database lookups, validation" />
      <PageHeader
        title="Reference Lists"
        description="Manage system lookup tables, catalogs, and reference lists."
      >
        <Button
          size="sm"
          onClick={() => navigate("/platform-standard-content/reference-lists/create")}
          className="w-full sm:w-auto font-medium px-3 shadow-none gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px "
          disabled={isFetching}
        >
          <Plus className="h-4 w-4" /> Add Reference List
        </Button>
      </PageHeader>

      <div className="table-container">
        <div className="flex min-h-0 flex-1 flex-col p-0">
          <FilterBar>
            <h3 className="text-xs font-semibold text-muted-foreground ">
              Reference Lists ({filteredRegistries.length})
            </h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
                disabled={isFetching} 
                placeholder="Search registries..." 
                className="w-full sm:w-72"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                className="h-9 w-9  shrink-0 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px"
                disabled={isFetching}
              >
                <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </FilterBar>

          <DataTable
            data={filteredRegistries}
            columns={columns}
            isLoading={isLoading || isFetching}
            enablePagination
            pageSize={10}
            totalItems={filteredRegistries.length}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
            onRowClick={(registry) => navigate(`/platform-standard-content/reference-lists/${registry.registry_key}`)}
            emptyState={
              <EmptyState
                icon={ListChecks}
                title={searchText ? "No reference lists match filters" : "No reference lists"}
                description={
                  searchText
                    ? "We couldn't find any reference lists matching your search. Try adjusting your search query."
                    : "Create a new reference list to manage lookup registries."
                }
                className="min-h-0 border-0 bg-transparent py-10"
                actions={registries.length === 0 ? (
                  <Button
                    onClick={() => navigate("/platform-standard-content/reference-lists/create")}
                    className=" gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold"
                    disabled={isFetching}
                  >
                    <Plus className="size-3.5" /> Add Reference List
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
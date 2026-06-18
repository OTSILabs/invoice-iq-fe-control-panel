import { useState, useMemo } from "react"
import { Loader2, AlertCircle, RefreshCw, Edit2, MoreVertical, Plus, ListChecks, Eye } from "lucide-react"
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
import { useReferenceLists, useReferenceListPublications } from "@/api/hooks/useReferenceLists"
import type { ReferenceListRegistryResponse } from "@/types"
import { RegistryDialog } from "./components/RegistryDialog"

export function ReferenceLists() {
  const navigate = useNavigate()
  const { data: registries = [], isLoading, isError, refetch, isFetching } = useReferenceLists()
  const { data: publications } = useReferenceListPublications()

  if (publications && publications.length > 0) {
    console.debug("Active reference list publications available:", publications.length)
  }

  const [searchText, setSearchText] = useState("")
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: "create" | "edit";
    registry: ReferenceListRegistryResponse | null;
  }>({
    open: false,
    mode: "create",
    registry: null,
  })

  const handleOpenCreate = () => {
    setDialogState({ open: true, mode: "create", registry: null })
  }

  const handleOpenEdit = (registry: ReferenceListRegistryResponse) => {
    setDialogState({ open: true, mode: "edit", registry })
  }

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

  const columns: CustomColumnDef<ReferenceListRegistryResponse>[] = useMemo(
    () => [
      {
        accessorKey: "registry_key",
        header: "Registry Key",
        width: "25%",
        minWidth: "150px",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-foreground truncate block">
            {row.original.registry_key}
          </span>
        ),
      },
      {
        accessorKey: "display_label",
        header: "Display Label",
        width: "25%",
        minWidth: "150px",
        cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.display_label}</span>,
      },
      {
        accessorKey: "source_type",
        header: "Source",
        width: "100px",
        minWidth: "90px",
        maxWidth: "100px",
        cell: ({ row }) => {
          const type = row.original.source_type || "custom"
          const variant = type === "system" ? "default" : type === "standard" ? "secondary" : "outline"
          return (
            <Badge variant={variant} className="text-[10px] px-2 py-0.5 capitalize font-semibold">
              {type}
            </Badge>
          )
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        width: "40%",
        minWidth: "200px",
        cell: ({ row }) => (
          <span className="block truncate text-xs text-muted-foreground max-w-[450px]" title={row.original.description || ""}>
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        accessorKey: "sort_sequence",
        header: "Sort",
        width: "70px",
        minWidth: "60px",
        maxWidth: "70px",
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
                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => navigate(`/platform-standard-content/reference-lists/${row.original.registry_key}`)}>
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
      <p className="font-medium text-muted-foreground">Loading reference lists...</p>
    </div>
  )

  if (isError) return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Failed to load reference lists</h2>
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
        title="Reference Lists"
        description="Manage system lookup tables, catalogs, and reference lists."
      >
        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="w-full sm:w-auto font-medium px-3 shadow-none gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
          disabled={isFetching}
        >
          <Plus className="h-4 w-4" /> Add Reference List
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
                placeholder="Search registries..." 
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
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-primary/5 p-4 rounded-full mb-3 text-primary/80 border border-primary/10">
                  <ListChecks className="size-8 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {searchText
                    ? "No reference lists match filters"
                    : "No reference lists"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                  {searchText
                    ? "We couldn't find any reference lists matching your search. Try adjusting your search query."
                    : "Create a new reference list to manage lookup registries."}
                </p>
                {registries.length === 0 && (
                  <Button
                    onClick={handleOpenCreate}
                    className="mt-4 gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
                    disabled={isFetching}
                  >
                    <Plus className="size-3.5" /> Add Reference List
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>

      {dialogState.open && (dialogState.mode === "create" || dialogState.mode === "edit") && (
        <RegistryDialog
          key={dialogState.registry ? `edit-${dialogState.registry.registry_key}` : "create"}
          open={dialogState.open}
          onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
          registry={dialogState.registry}
        />
      )}
    </div>
  )
}

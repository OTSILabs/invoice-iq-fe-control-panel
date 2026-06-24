import { useParams, useNavigate } from "react-router-dom"
import { useState, useMemo, useCallback } from "react"
import { ArrowLeft, ListChecks, Loader2, AlertCircle, RefreshCw, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/search-input"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState, PageShell, SemanticBadge } from "@/components/invoice-ui/design-system"

import { useReferenceListDetail, useReferenceValues } from "@/api/hooks/useReferenceLists"
import type { RegistryDetailsCardProps } from "@/types";
import { getReferenceListDetailsColumns } from "@/columns"

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}



function RegistryDetailsCard({ registry }: RegistryDetailsCardProps) {
  return (
    <div className="surface-card w-full overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <ListChecks className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-snug text-foreground" title={registry.display_label}>{registry.display_label}</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{registry.registry_key}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Source Type", content: <SemanticBadge tone="neutral" className="capitalize">{registry.source_type || "custom"}</SemanticBadge> },
            { label: "Sort Sequence", content: <p className="text-sm font-semibold text-foreground">{registry.sort_sequence}</p> },
            { label: "Version Number", content: <p className="text-xs font-mono font-bold text-foreground">v{registry.version_no}</p> },
            { label: "Created At", content: <p className="text-xs font-semibold text-foreground">{formatDate(registry.created_at || undefined)}</p> },
            { label: "Updated At", content: <p className="text-xs font-semibold text-foreground">{formatDate(registry.updated_at || undefined)}</p> },
            { label: "Registry Key / Code", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={registry.registry_key}>{registry.registry_key}</p> }
          ].map((item) => (
            <div key={item.label} className="flex min-h-20 flex-col justify-center rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/45">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">{item.label}</p>
              {item.content}
            </div>
          ))}

          {/* Description - Full Width Row */}
          <div className="col-span-1 flex flex-col justify-center rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/45 sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {registry.description || <span className="text-muted-foreground italic">No description provided.</span>}
            </p>
          </div>
        </div>
    </div>
  )
}

export function ReferenceListDetails() {
  const { key = "" } = useParams<{ key: string }>()
  const navigate = useNavigate()

  const { data: registry, isLoading: isRegistryLoading, isError: isRegistryError, refetch: refetchRegistry } = useReferenceListDetail(key)
  const { data: values = [], isLoading: isValuesLoading, isError: isValuesError, refetch: refetchValues, isFetching: isValuesFetching } = useReferenceValues(key)

  const [searchText, setSearchText] = useState("")

  const handleRefetch = useCallback(async () => {
    try {
      await Promise.all([refetchRegistry(), refetchValues()])
      toast.success("Reference list details refreshed")
    } catch {
      toast.error("Failed to refresh details")
    }
  }, [refetchRegistry, refetchValues])

  const filteredValues = useMemo(() => {
    if (!searchText.trim()) return values
    const query = searchText.toLowerCase()
    return values.filter(
      (v) =>
        v.value_code.toLowerCase().includes(query) ||
        v.value_label.toLowerCase().includes(query) ||
        (v.description && v.description.toLowerCase().includes(query))
    )
  }, [values, searchText])

  const columns = useMemo(
    () => getReferenceListDetailsColumns(navigate, key, (valueItem) => navigate(`/platform-standard-content/reference-lists/${key}/${valueItem.value_code}/edit`)),
    [navigate, key]
  )

  const isLoading = isRegistryLoading || isValuesLoading
  const isError = isRegistryError || isValuesError

  if (isError || (!isLoading && !registry)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground">Failed to load reference list details.</p>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefetch} variant="outline" size="sm" className="gap-2" disabled={isValuesFetching}>
            <RefreshCw className={`h-4 w-4 ${isValuesFetching ? "animate-spin" : ""}`} /> Try Again
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/platform-standard-content/reference-lists")}>
            Back to reference lists
          </Button>
        </div>
      </PageShell>
    )
  }

  if (isLoading || !registry) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Loading details...</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title="Reference List Details"
        description="View and manage lookup tables, versions, and reference values."
      >
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border shadow-sm cursor-pointer" onClick={() => navigate("/platform-standard-content/reference-lists")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </PageHeader>

      {/* Details Card */}
      <RegistryDetailsCard registry={registry} />

      {/* Values Sub-Table Section */}
      <div className="table-container">
          <div className="filter-toolbar">
            <h2 className="text-sm font-semibold text-foreground">Configured Reference Values</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-end">
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
                disabled={isValuesFetching} 
                placeholder="Search reference values..." 
                className="w-full sm:w-64"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefetch}
                className="h-9 w-9 cursor-pointer shrink-0 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px"
                disabled={isValuesFetching}
              >
                <RefreshCw className={cn("size-4", isValuesFetching && "animate-spin")} />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(`/platform-standard-content/reference-lists/${key}/values/create`)}
                className="font-medium px-3 gap-1 shadow-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer shrink-0"
                disabled={isValuesFetching}
              >
                <Plus className="h-4 w-4" /> Add Value
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredValues}
            columns={columns}
            isLoading={isLoading || isValuesFetching}
            enablePagination
            pageSize={10}
            totalItems={filteredValues.length}
            stickyHeader
            fillAvailableHeight
            tableContainerClassName="border-0 rounded-none bg-transparent"
            onRowClick={(valueItem) => navigate(`/platform-standard-content/reference-lists/${key}/${valueItem.value_code}`)}
            emptyState={
              <EmptyState
                icon={ListChecks}
                title={searchText ? "No reference values match filters" : "No reference values"}
                description={
                  searchText
                    ? "We couldn't find any reference values matching your search. Try adjusting your search query."
                    : "Create a reference value to append codes and labels to this lookup registry."
                }
                className="min-h-0 border-0 bg-transparent py-10"
                actions={values.length === 0 ? (
                  <Button
                    onClick={() => navigate(`/platform-standard-content/reference-lists/${key}/values/create`)}
                    className="cursor-pointer gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold"
                    disabled={isValuesFetching}
                  >
                    <Plus className="size-3.5" /> Add Value
                  </Button>
                ) : undefined}
              />
            }
            />
      </div>
    </PageShell>
  )
}

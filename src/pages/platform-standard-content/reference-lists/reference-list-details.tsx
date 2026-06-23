import { useParams, useNavigate } from "react-router-dom"
import { useState, useMemo, useCallback } from "react"
import { ArrowLeft, ListChecks, Loader2, AlertCircle, RefreshCw, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/search-input"
import { cn } from "@/lib/utils"

import { useReferenceListDetail, useReferenceValues } from "@/api/hooks/useReferenceLists"
import type { ReferenceValueResponse, RegistryDetailsCardProps } from "@/types";
import { ValueDialog } from "./components/ValueDialog"
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
    <div className="w-full">
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
        <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />
        
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <ListChecks className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug truncate" title={registry.display_label}>{registry.display_label}</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{registry.registry_key}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
          {[
            { label: "Source Type", content: <Badge variant="outline" className="text-xxs px-2 py-0.5 capitalize font-semibold bg-slate-50 text-slate-700 border-slate-200">{registry.source_type || "custom"}</Badge> },
            { label: "Sort Sequence", content: <p className="text-sm font-semibold text-foreground">{registry.sort_sequence}</p> },
            { label: "Version Number", content: <p className="text-xs font-mono font-bold text-foreground">v{registry.version_no}</p> },
            { label: "Created At", content: <p className="text-xs font-semibold text-foreground">{formatDate(registry.created_at || undefined)}</p> },
            { label: "Updated At", content: <p className="text-xs font-semibold text-foreground">{formatDate(registry.updated_at || undefined)}</p> },
            { label: "Registry Key / Code", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={registry.registry_key}>{registry.registry_key}</p> }
          ].map((item) => (
            <div key={item.label} className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
              {item.content}
            </div>
          ))}

          {/* Description - Full Width Row */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center border-t border-border/10">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {registry.description || <span className="text-muted-foreground italic">No description provided.</span>}
            </p>
          </div>
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
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    valueItem: ReferenceValueResponse | null;
  }>({
    open: false,
    valueItem: null,
  })

  const handleOpenCreate = useCallback(() => {
    setDialogState({ open: true, valueItem: null })
  }, [])

  const handleOpenEdit = useCallback((valueItem: ReferenceValueResponse) => {
    setDialogState({ open: true, valueItem })
  }, [])

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

  const columns = useMemo(() => getReferenceListDetailsColumns(navigate, key, handleOpenEdit), [navigate, key, handleOpenEdit])

  const isLoading = isRegistryLoading || isValuesLoading
  const isError = isRegistryError || isValuesError

  if (isError || (!isLoading && !registry)) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
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
      </div>
    )
  }

  if (isLoading || !registry) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Loading details...</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Reference List Details</h1>
          <p className="text-xs text-muted-foreground">View and manage lookup tables, versions, and reference values.</p>
        </div>
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border shadow-sm cursor-pointer" onClick={() => navigate("/platform-standard-content/reference-lists")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Details Card */}
      <RegistryDetailsCard registry={registry} />

      {/* Values Sub-Table Section */}
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-border p-0 shadow-sm">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="flex flex-col gap-3 border-b bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
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
                onClick={handleOpenCreate}
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
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center animate-in fade-in duration-300">
                <div className="bg-primary/5 p-4 rounded-full mb-3 text-primary/80 border border-primary/10">
                  <ListChecks className="size-8 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {searchText
                    ? "No reference values match filters"
                    : "No reference values"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                  {searchText
                    ? "We couldn't find any reference values matching your search. Try adjusting your search query."
                    : "Create a reference value to append codes and labels to this lookup registry."}
                </p>
                {values.length === 0 && (
                  <Button
                    onClick={handleOpenCreate}
                    className="mt-4 gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer"
                    disabled={isValuesFetching}
                  >
                    <Plus className="size-3.5" /> Add Value
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>

      {dialogState.open && (
        <ValueDialog
          key={dialogState.valueItem ? `edit-${dialogState.valueItem.value_code}` : "create"}
          open={dialogState.open}
          onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
          registryKey={key}
          valueItem={dialogState.valueItem}
        />
      )}
    </div>
  )
}

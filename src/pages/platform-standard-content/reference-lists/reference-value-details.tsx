import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ListChecks, Loader2, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useReferenceValueDetail } from "@/api/hooks/useReferenceLists"

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

export function ReferenceValueDetails() {
  const { key = "", valueCode = "" } = useParams<{ key: string; valueCode: string }>()
  const navigate = useNavigate()

  const { data: detail, isLoading, isError, refetch, isFetching } = useReferenceValueDetail(key, valueCode)

  if (isError || (!isLoading && !detail)) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-sm text-muted-foreground">Failed to load reference value details.</p>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2" disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Try Again
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/platform-standard-content/reference-lists/${key}`)}>
            Back to registry
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading || !detail) {
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
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Reference Item Details</h1>
          <p className="text-xs text-muted-foreground">View detailed specifications of the selected lookup registry value</p>
        </div>
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border shadow-sm cursor-pointer" onClick={() => navigate(`/platform-standard-content/reference-lists/${key}`)}>
          <ArrowLeft className="h-4 w-4" /> Back to registry
        </Button>
      </div>

      {/* Details Card */}
      <div className="w-full">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />
          
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <ListChecks className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate" title={detail.value_label}>{detail.value_label}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{detail.value_code}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
            {[
              { label: "Sort Sequence", content: <p className="text-sm font-semibold text-foreground">{detail.sort_sequence}</p> },
              { label: "Registry Key / Code", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={detail.registry_key}>{detail.registry_key}</p> },
              { label: "Version Number", content: <p className="text-xs font-mono font-bold text-foreground">v{detail.version_no}</p> },
              { label: "Created At", content: <p className="text-xs font-semibold text-foreground">{formatDate(detail.created_at || undefined)}</p> },
              { label: "Updated At", content: <p className="text-xs font-semibold text-foreground">{formatDate(detail.updated_at || undefined)}</p> },
              { label: "Value Key / Code", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={detail.value_code}>{detail.value_code}</p> }
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
                {detail.description || <span className="text-muted-foreground italic">No description provided.</span>}
              </p>
            </div>

            {/* Custom Attributes - Full Width Row */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center border-t border-border/10">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Custom JSON Attributes</p>
              {detail.attributes && Object.keys(detail.attributes).length > 0 ? (
                <pre className="text-xs font-mono bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-border/80 overflow-x-auto text-foreground whitespace-pre-wrap max-w-full">
                  {JSON.stringify(detail.attributes, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground italic">No custom attributes configured.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

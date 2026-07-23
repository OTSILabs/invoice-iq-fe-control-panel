import { PageMetadata } from "@/components/layout/PageMetadata"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ListChecks, Loader2, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useReferenceValueDetail } from "@/api/hooks/useReferenceLists"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell } from "@/components/invoice-ui/design-system"
import { formatDateTime } from "@/lib/utils"
import { DetailGrid } from "@/components/ui/detail-grid"

export function ReferenceValueDetails() {
  const { key = "", valueCode = "" } = useParams<{ key: string; valueCode: string }>()
  const navigate = useNavigate()

  const { data: detail, isLoading, isError, refetch, isFetching } = useReferenceValueDetail(key, valueCode)

  if (isError || (!isLoading && !detail)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
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
      </PageShell>
    )
  }

  if (isLoading || !detail) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Loading details...</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageMetadata title="Reference Value Details" description="Configure reference value details." keywords="reference value, lookups" />
      {/* Header */}
      <PageHeader
        title="Reference Item Details"
        description="View detailed specifications of the selected lookup registry value."
      >
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border" onClick={() => navigate(`/platform-standard-content/reference-lists/${key}`)}>
          <ArrowLeft className="h-4 w-4" /> Back to registry
        </Button>
      </PageHeader>

      {/* Details Card */}
      <div className="surface-card w-full overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <ListChecks className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-snug text-foreground" title={detail.value_label}>{detail.value_label}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{detail.value_code}</p>
              </div>
            </div>
          </div>

          <DetailGrid cols={3}>
            {[
              { label: "Sort Sequence", content: <p className="text-sm font-semibold text-foreground">{detail.sort_sequence}</p> },
              { label: "Registry Key / Code", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={detail.registry_key}>{detail.registry_key}</p> },
              { label: "Version Number", content: <p className="text-xs font-mono font-bold text-foreground">v{detail.version_no}</p> },
              { label: "Created At", content: <p className="text-xs font-semibold text-foreground">{formatDateTime(detail.created_at, "—")}</p> },
              { label: "Updated At", content: <p className="text-xs font-semibold text-foreground">{formatDateTime(detail.updated_at, "—")}</p> },
              { label: "Value Key / Code", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={detail.value_code}>{detail.value_code}</p> }
            ].map((item) => (
              <DetailGrid.Item key={item.label} label={item.label}>
                {item.content}
              </DetailGrid.Item>
            ))}
          </DetailGrid>

          {/* Description */}
          <div className="flex flex-col gap-1.5 border-t border-border/45 bg-card px-5 py-4">
            <p className="text-xs font-bold  text-muted-foreground">Description</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {detail.description || <span className="text-muted-foreground italic">No description provided.</span>}
            </p>
          </div>

          {/* Custom Attributes */}
          <div className="flex flex-col gap-1.5 border-t border-border/45 bg-card px-5 py-4">
            <p className="text-xs font-bold  text-muted-foreground">Custom JSON Attributes</p>
            {detail.attributes && Object.keys(detail.attributes).length > 0 ? (
              <pre className="max-w-full overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-100  mt-1">
                {JSON.stringify(detail.attributes, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground italic">No custom attributes configured.</p>
            )}
          </div>
      </div>
    </PageShell>
  )
}
import { PageMetadata } from "@/components/layout/PageMetadata"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Tags, Loader2, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useFieldCategory } from "@/api/hooks/useFieldCategories"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SemanticBadge } from "@/components/invoice-ui/design-system"
import { DetailGrid } from "@/components/ui/detail-grid"

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

export function FieldCategoryDetails() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const { data: category, isLoading, isError, refetch, isFetching } = useFieldCategory(code || "")

  if (isError || (!isLoading && !category)) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground">Failed to load field category details.</p>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2" disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Try Again
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/platform-standard-content/field-categories")}>
            Back to field categories
          </Button>
        </div>
      </PageShell>
    )
  }

  if (isLoading || !category) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Loading category details...</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageMetadata title="Field Category Details" description="Configure field category settings." keywords="field categories, tags, taxonomy" />
      {/* Header */}
      <PageHeader
        title="Field Category Details"
        description="View and manage field category details and standard configurations."
      >
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border shadow-sm " onClick={() => navigate("/platform-standard-content/field-categories")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </PageHeader>

      {/* Details Card */}
      <div className="surface-card w-full overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <Tags className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-snug text-foreground" title={category.ui_label}>{category.ui_label}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{category.field_category_code}</p>
              </div>
            </div>
          </div>

          <DetailGrid cols={3}>
            {[
              { label: "Sort Sequence", content: <p className="text-sm font-semibold text-foreground">{category.sort_sequence}</p> },
              { label: "Fields Count", content: <SemanticBadge tone="accent">{category.example_fields?.length || 0} Fields</SemanticBadge> },
              { label: "Version Number", content: <p className="text-xs font-mono font-bold text-foreground">v{category.version_no}</p> },
              { label: "Created At", content: <p className="text-xs font-semibold text-foreground">{formatDate(category.created_at || undefined)}</p> },
              { label: "Updated At", content: <p className="text-xs font-semibold text-foreground">{formatDate(category.updated_at || undefined)}</p> },
              { label: "Category ID / Code", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={category.field_category_code}>{category.field_category_code}</p> }
            ].map((item) => (
              <DetailGrid.Item key={item.label} label={item.label}>
                {item.content}
              </DetailGrid.Item>
            ))}
          </DetailGrid>

          {/* Example Fields */}
          <div className="flex flex-col gap-1.5 border-t border-border/45 bg-card px-5 py-4">
            <p className="text-xs font-bold  text-muted-foreground">Example Fields</p>
            {category.example_fields && category.example_fields.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {category.example_fields.map((field) => (
                  <SemanticBadge
                    key={field}
                    tone="neutral"
                    className="font-mono"
                  >
                    {field}
                  </SemanticBadge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No example fields configured.</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 border-t border-border/45 bg-card px-5 py-4">
            <p className="text-xs font-bold  text-muted-foreground">Description</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {category.description || <span className="text-muted-foreground italic">No description provided.</span>}
            </p>
          </div>
      </div>
    </PageShell>
  )
}
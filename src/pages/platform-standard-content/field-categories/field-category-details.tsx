import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Tags, Loader2, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFieldCategory } from "@/api/hooks/useFieldCategories"

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
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
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
      </div>
    )
  }

  if (isLoading || !category) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Loading category details...</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Field Category Details</h1>
          <p className="text-xs text-muted-foreground">View and manage field category details and standard configurations</p>
        </div>
        <Button variant="outline" size="sm" className="font-medium gap-1.5 border-border shadow-sm cursor-pointer" onClick={() => navigate("/platform-standard-content/field-categories")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Details Card */}
      <div className="w-full">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="h-[3px] w-full bg-gradient-to-r from-primary to-chart-1" />
          
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Tags className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate" title={category.ui_label}>{category.ui_label}</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{category.field_category_code}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
            {[
              { label: "Sort Sequence", content: <p className="text-sm font-semibold text-foreground">{category.sort_sequence}</p> },
              { label: "Fields Count", content: <Badge variant="outline" className="text-xxs px-2 py-0.5 font-semibold bg-slate-50 text-slate-700 border-slate-200">{category.example_fields?.length || 0} Fields</Badge> },
              { label: "Version Number", content: <p className="text-xs font-mono font-bold text-foreground">v{category.version_no}</p> },
              { label: "Created At", content: <p className="text-xs font-semibold text-foreground">{formatDate(category.created_at || undefined)}</p> },
              { label: "Updated At", content: <p className="text-xs font-semibold text-foreground">{formatDate(category.updated_at || undefined)}</p> },
              { label: "Category ID / Code", content: <p className="font-mono text-xs font-medium text-foreground truncate" title={category.field_category_code}>{category.field_category_code}</p> }
            ].map((item) => (
              <div key={item.label} className="bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                {item.content}
              </div>
            ))}

            {/* Example Fields - Full Width Row */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Example Fields</p>
              {category.example_fields && category.example_fields.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {category.example_fields.map((field) => (
                    <Badge
                      key={field}
                      variant="outline"
                      className="font-mono text-xs px-2.5 py-1 bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 text-slate-700 transition-colors"
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No example fields configured.</p>
              )}
            </div>

            {/* Description - Full Width Row */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-card px-4 py-3.5 hover:bg-muted/10 transition-colors flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {category.description || <span className="text-muted-foreground italic">No description provided.</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDataType } from "@/api/hooks/data-types"

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

export function DataTypeDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const { data: dataType, isLoading, isError } = useDataType(code || "")

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isError || !dataType) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
        <p className="text-sm text-muted-foreground">Failed to load data type details.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/platform-standard-content/data-types")}
        >
          Back to Data Types
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Data Type Details</h1>
          <p className="text-xs text-muted-foreground">View details and configuration for this standard data type</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="font-medium gap-1.5 border-border shadow-sm cursor-pointer"
          onClick={() => navigate("/platform-standard-content/data-types")}
        >
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
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate" title={dataType.display_label}>
                  {dataType.display_label}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">
                  {dataType.data_type_code}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 dark:bg-border/10 overflow-hidden">
            {[
              {
                label: "Code",
                content: (
                  <p className="font-mono text-xs font-semibold text-foreground truncate" title={dataType.data_type_code}>
                    {dataType.data_type_code}
                  </p>
                )
              },
              {
                label: "Display Label",
                content: <p className="text-xs font-semibold text-foreground">{dataType.display_label}</p>
              },
              {
                label: "Sample Value",
                content: (
                  <p className="font-mono text-xs font-semibold text-foreground truncate" title={dataType.sample_value || "—"}>
                    {dataType.sample_value || "—"}
                  </p>
                )
              },
              {
                label: "Sort Sequence",
                content: <p className="text-xs font-semibold text-foreground">{dataType.sort_sequence ?? "—"}</p>
              },
              {
                label: "Created At",
                content: <p className="text-xs font-semibold text-foreground">{formatDate(dataType.created_at)}</p>
              },
              {
                label: "Updated At",
                content: <p className="text-xs font-semibold text-foreground">{formatDate(dataType.updated_at)}</p>
              }
            ].map((item) => (
              <div key={item.label} className="bg-card px-5 py-4 hover:bg-muted/10 transition-colors flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                {item.content}
              </div>
            ))}
          </div>

          <div className="bg-card px-5 py-4 border-t border-border flex flex-col gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {dataType.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

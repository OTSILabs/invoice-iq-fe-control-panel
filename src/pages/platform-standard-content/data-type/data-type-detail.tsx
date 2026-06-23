import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDataType } from "@/api/hooks/data-types"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell } from "@/components/invoice-ui/design-system"

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
      <PageShell className="min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </PageShell>
    )
  }

  if (isError || !dataType) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load data type details.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/platform-standard-content/data-types")}
        >
          Back to Data Types
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title="Data Type Details"
        description="View details and configuration for this standard data type."
      >
        <Button
          variant="outline"
          size="sm"
          className="font-medium gap-1.5 border-border shadow-sm cursor-pointer"
          onClick={() => navigate("/platform-standard-content/data-types")}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </PageHeader>

      {/* Details Card */}
      <div className="surface-card w-full overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border/45 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-snug text-foreground" title={dataType.display_label}>
                  {dataType.display_label}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">
                  {dataType.data_type_code}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <div key={item.label} className="flex min-h-20 flex-col justify-center rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/45">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">{item.label}</p>
                {item.content}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border/45 bg-card px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</p>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {dataType.description || "No description provided."}
            </p>
          </div>
      </div>
    </PageShell>
  )
}

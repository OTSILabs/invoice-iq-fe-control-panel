import { PageMetadata } from "@/components/layout/PageMetadata"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, Edit2 } from "lucide-react"

import { useExtractionField } from "@/api/hooks/useExtractionFields"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { IqActiveStatusBadge, IqContentTypeBadge } from "@/components/invoice-ui/iq-status-badges"
import { SemanticBadge } from "@/components/invoice-ui/design-system"
import { DetailGrid } from "@/components/ui/detail-grid"
import { CopyButton } from "@/components/ui/copyable-field"
import { humanizeDateTime } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

function toOptionalDisplayValue(val: string | number | null | undefined): string {
  return val ? String(val) : "—"
}

export function ExtractionFieldDetailsPage() {
  const { fieldId = "" } = useParams<{ fieldId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState("overview")

  const fieldQuery = useExtractionField(fieldId)
  const fieldItem = fieldQuery.data

  const isAnyLoading = fieldQuery.isLoading

  if (isAnyLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  if (!fieldItem) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Extraction field not found.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate("/platform-standard-content/extraction-management?tab=fields")
          }
        >
          Back to Extraction Fields
        </Button>
      </PageShell>
    )
  }


  return (
    <PageShell>
      {/* ── Header ── */}
      <PageHeader
        title="Field Details"
        description="View and manage extraction field configuration and guidance."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigate("/platform-standard-content/extraction-management?tab=fields")
          }
          className="gap-2 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          size="sm"
          onClick={() =>
            navigate(
              `/platform-standard-content/extraction-management/fields/${fieldItem.field_id}/edit`
            )
          }
          className="gap-2 shrink-0 "
        >
          <Edit2 className="h-4 w-4" /> Edit Field
        </Button>
      </PageHeader>

      {/* ── Identity Card ── */}
      <IdentityCard fieldItem={fieldItem} />

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab} >
        <TabsList variant="line" className="border-b border-border w-full justify-start [&>button]:flex-none mb-4">
          {[
            { value: "overview", label: "Overview" },
            { value: "data_validation", label: "Data & Validation" },
            { value: "guidance", label: "Extraction Guidance" },
            { value: "audit", label: "Audit" },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="cursor-pointer"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" >
          <OverviewTab fieldItem={fieldItem} />
        </TabsContent>

        {/* Data & Validation Tab */}
        <TabsContent value="data_validation" >
          <DataValidationTab fieldItem={fieldItem} />
        </TabsContent>

        {/* Extraction Guidance Tab */}
        <TabsContent value="guidance" >
          <GuidanceTab fieldItem={fieldItem} />
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit">
          <AuditTab fieldItem={fieldItem} />
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}

function IdentityCard({ fieldItem }: { fieldItem: any }) {
  const category = fieldItem.field_category
  const dataType = fieldItem.data_type

  const categoryLabel = category?.ui_label || fieldItem.field_category_code
  const dataTypeLabel = dataType?.display_label || fieldItem.data_type_code

  return (
    <div className="rounded-xl border bg-card">
      {/* Avatar + name row */}
      <div className="flex items-center gap-4 px-6 py-5 border-b">
        <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
          {fieldItem.field_label?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-base font-semibold leading-tight">
              {fieldItem.field_label}
            </span>
            <IqActiveStatusBadge isActive={true} />
            <IqContentTypeBadge
              contentType={fieldItem.content_type}
              isStandard={fieldItem.content_type === "Standard"}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {fieldItem.field_id}
          </p>
        </div>
      </div>

      {/* Facts grid */}
      <DetailGrid cols={4}>
        <DetailGrid.Item label="Field ID">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-medium text-foreground truncate" title={fieldItem.field_id}>{fieldItem.field_id}</span>
            <CopyButton value={fieldItem.field_id} label="Field ID" />
          </div>
        </DetailGrid.Item>
        <DetailGrid.Item label="Data Type">
          <span className="text-xs font-semibold text-foreground">{dataTypeLabel}</span>
        </DetailGrid.Item>
        <DetailGrid.Item label="Category">
          <span className="text-xs font-semibold text-foreground">{categoryLabel}</span>
        </DetailGrid.Item>
        <DetailGrid.Item label="Position">
          <span className="text-xs font-semibold text-foreground capitalize">{fieldItem.header_item}</span>
        </DetailGrid.Item>
        
        <DetailGrid.Item label="Source Mode">
          <span className="text-xs font-semibold text-foreground capitalize">
            {toOptionalDisplayValue(fieldItem.field_source_mode || "Native")}
          </span>
        </DetailGrid.Item>
        <DetailGrid.Item label="Version">
          <span className="text-xs font-semibold text-foreground">{fieldItem.version_no}</span>
        </DetailGrid.Item>
        <DetailGrid.Item label="Created At">
          <span className="text-xs font-semibold text-foreground">
            {fieldItem.created_at
              ? humanizeDateTime(fieldItem.created_at, "dd MMM yyyy, h:mm a")
              : "—"}
          </span>
        </DetailGrid.Item>
        <DetailGrid.Item label="Updated At">
          <span className="text-xs font-semibold text-foreground">
            {fieldItem.updated_at
              ? humanizeDateTime(fieldItem.updated_at, "dd MMM yyyy, h:mm a")
              : "—"}
          </span>
        </DetailGrid.Item>
      </DetailGrid>
    </div>
  )
}

function OverviewTab({ fieldItem }: { fieldItem: any }) {
  const category = fieldItem.field_category
  const categoryLabel = category?.ui_label || fieldItem.field_category_code

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Short & Long Description card */}
      <div className="md:col-span-3 rounded-xl border bg-card p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Short Description</p>
          <p className="text-sm">
            {fieldItem.short_desc || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Long Description</p>
          <p className="text-sm">
            {fieldItem.field_long_description || "—"}
          </p>
        </div>
      </div>

      {/* Category Extended Details */}
      <div className="md:col-span-2 rounded-xl border bg-card p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Category: {categoryLabel}</span>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{fieldItem.field_category_code}</span>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground font-medium block mb-1">Description</span>
            <span className="text-sm">{category?.description || "—"}</span>
          </div>
        </div>
      </div>

      {/* Content Type */}
      <div className="rounded-xl border bg-card p-5 flex flex-col justify-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Content Type</span>
        <IqContentTypeBadge
          contentType={fieldItem.content_type}
          isStandard={fieldItem.content_type === "Standard"}
        />
      </div>
    </div>
  )
}

function DataValidationTab({ fieldItem }: { fieldItem: any }) {
  const dataType = fieldItem.data_type
  const dataTypeLabel = dataType?.display_label || fieldItem.data_type_code

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Data Type Details */}
      <div className="md:col-span-3 rounded-xl border bg-card p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold">Data Type: {dataTypeLabel}</span>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{fieldItem.data_type_code}</span>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground font-medium block mb-1">Description</span>
              <span className="text-sm">{dataType?.description || "—"}</span>
            </div>
          </div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block mb-1">Sample Value</span>
          <span className="text-sm font-medium">{dataType?.sample_value || "—"}</span>
        </div>
      </div>

      {/* Value Rules Details */}
      <div className="md:col-span-3 rounded-xl border bg-card divide-y">
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">Allowed Value Mode</p>
            <p className="text-sm font-medium capitalize">{fieldItem.allowed_value_mode}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium">Default Value</p>
            <p className="text-sm font-medium">
              {toOptionalDisplayValue(fieldItem.default_value)}
            </p>
          </div>
        </div>

        {fieldItem.allowed_value_mode === "reference_list" && (
          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Reference List</p>
            {fieldItem.reference_list ? (
              <div className="flex flex-col gap-1.5 mt-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{fieldItem.reference_list.display_label}</span>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{fieldItem.reference_list.registry_key}</span>
                </div>
                {fieldItem.reference_list.description && (
                  <p className="text-sm text-muted-foreground">{fieldItem.reference_list.description}</p>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium font-mono mt-1">
                {toOptionalDisplayValue(fieldItem.allowed_reference_registry_key)}
              </p>
            )}
          </div>
        )}

        {fieldItem.allowed_value_mode === "static_list" && (
          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Allowed Values</p>
            <div className="flex flex-wrap gap-1.5">
              {(fieldItem.allowed_static_list?.length ?? 0) > 0 ? (
                fieldItem.allowed_static_list!.map((val: string, idx: number) => (
                  <SemanticBadge key={`${val}_${idx}`} tone="neutral" className="font-medium">
                    {val}
                  </SemanticBadge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function GuidanceTab({ fieldItem }: { fieldItem: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Source Mode & Position */}
      <div className="md:col-span-3 rounded-xl border bg-card p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Source Mode</p>
          <p className="text-sm font-medium capitalize">
            {toOptionalDisplayValue(fieldItem.field_source_mode || "Native")}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Document Position (Header/Line Item)</p>
          <p className="text-sm font-medium capitalize">
            {fieldItem.header_item}
          </p>
        </div>
      </div>
      {/* Alternate Labels */}
      <div className="rounded-xl border bg-card p-5">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Alternate Labels</p>
        <div className="flex flex-wrap gap-1.5">
          {(fieldItem.labels?.length ?? 0) > 0 ? (
            fieldItem.labels!.map((lbl: string, idx: number) => (
              <SemanticBadge key={`${lbl}_${idx}`} tone="neutral" className="font-medium">
                {lbl}
              </SemanticBadge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Examples */}
      <div className="rounded-xl border bg-card p-5">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Examples</p>
        <div className="flex flex-wrap gap-1.5">
          {(fieldItem.examples?.length ?? 0) > 0 ? (
            fieldItem.examples!.map((ex: string, idx: number) => (
              <SemanticBadge key={`${ex}_${idx}`} tone="neutral" className="font-medium">
                {ex}
              </SemanticBadge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border bg-card p-5">
        <p className="text-xs text-muted-foreground mb-3 font-medium">
          Extraction Instructions
        </p>
        {(fieldItem.extraction_instructions?.length ?? 0) > 0 ? (
          <ol className="space-y-2">
            {fieldItem.extraction_instructions!.map((inst: string, idx: number) => (
              <li key={inst} className="flex gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">{idx + 1}.</span>
                <span>{inst}</span>
              </li>
            ))}
          </ol>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    </div>
  )
}

function AuditTab({ fieldItem }: { fieldItem: any }) {
  return (
    <div className="rounded-xl border bg-card divide-y">
      <PageMetadata title="Extraction Field Details" description="Configure extraction field details." keywords="extraction field, template field" />
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-medium">Created At</p>
          <p className="text-sm font-medium">
            {fieldItem.created_at
              ? humanizeDateTime(fieldItem.created_at, "dd MMM yyyy, h:mm a")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-medium">Updated At</p>
          <p className="text-sm font-medium">
            {fieldItem.updated_at
              ? humanizeDateTime(fieldItem.updated_at, "dd MMM yyyy, h:mm a")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-medium">Created By</p>
          <p className="text-sm font-medium">
            {toOptionalDisplayValue(fieldItem.created_by)}
          </p>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-xs text-muted-foreground mb-1 font-medium">Version</p>
        <p className="text-sm font-medium">{fieldItem.version_no}</p>
      </div>
    </div>
  )
}
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Edit2, Search, X } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { PageLoader } from "@/components/layout/PageLoader";
import {
  PageDescription,
  PageDescriptiveSection,
  PageTitle,
} from "@/components/invoice-ui/typography";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { APP_ROUTES } from "@/config/routes-helper";
import { useDerivedTemplate } from "@/api/hooks/useDerivedTemplates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailGrid } from "@/components/ui/detail-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  FilterDropdown,
  FilterDropdownContent,
  FilterDropdownTrigger,
} from "@/components/invoice-ui/filter-dropdown";
import type { FilterGroup, FilterValue } from "@/components/invoice-ui/filter-dropdown-context";
import { FieldsListTable, type FieldListTableRecord } from "@/components/invoice-ui/templates/fields-list-table";
import {
  getFieldLabel,
  getFieldCode,
  getFieldShortDescription,
  getFieldLongDescription,
  getFieldExamples,
  getFieldInstructions,
} from "@/components/invoice-ui/templates/template-data";

const TEMPLATE_DETAILS_TABS = {
  DETAILS: "details",
  FIELDS: "fields",
} as const;

const FIELD_FILTER_GROUP_IDS = {
  POSITION: "position",
  CONTENT_TYPE: "content_type",
  DATA_TYPE: "data_type",
} as const;

type TemplateDetailsTab = (typeof TEMPLATE_DETAILS_TABS)[keyof typeof TEMPLATE_DETAILS_TABS];

function isTemplateDetailsTab(value: string | null): value is TemplateDetailsTab {
  return value === TEMPLATE_DETAILS_TABS.DETAILS || value === TEMPLATE_DETAILS_TABS.FIELDS;
}

// --- Module-scope helpers ---
function getFieldFilterGroups(fields: unknown[]) {
  const positions = new Set<string>();
  const contentTypes = new Set<string>();
  const dataTypes = new Set<string>();

  fields.forEach((f: any) => {
    const pos = f?.header_item ?? f?.header ?? null;
    if (pos) positions.add(String(pos));

    const ct = f?.content_type ?? f?.field_content_type ?? null;
    if (ct) contentTypes.add(String(ct));

    const dt = f?.data_type ?? f?.field_type ?? null;
    if (dt) dataTypes.add(String(dt));
  });

  const makeOptions = (set: Set<string>) =>
    Array.from(set).map((value) => ({ value: String(value), label: String(value) }));

  const groups: FilterGroup[] = [];

  groups.push({
    id: FIELD_FILTER_GROUP_IDS.POSITION,
    label: "Position",
    options: makeOptions(positions),
  });

  groups.push({
    id: FIELD_FILTER_GROUP_IDS.CONTENT_TYPE,
    label: "Content type",
    options: makeOptions(contentTypes),
  });

  groups.push({
    id: FIELD_FILTER_GROUP_IDS.DATA_TYPE,
    label: "Data type",
    options: makeOptions(dataTypes),
  });

  return groups;
}

function matchesFieldSearch(field: unknown, search: string) {
  if (!search) return true;
  const needle = search.toLowerCase();
  const label = getFieldLabel(field).toLowerCase();
  const code = getFieldCode(field).toLowerCase();
  const short = String(getFieldShortDescription(field) ?? "").toLowerCase();
  const long = String(getFieldLongDescription(field) ?? "").toLowerCase();
  const examples = (getFieldExamples(field) ?? []).join(" ").toLowerCase();
  const instr = (getFieldInstructions(field) ?? []).join(" ").toLowerCase();

  return (
    label.includes(needle) ||
    code.includes(needle) ||
    short.includes(needle) ||
    long.includes(needle) ||
    examples.includes(needle) ||
    instr.includes(needle)
  );
}

function matchesFieldFilters(field: any, filters: Record<string, string[]>) {
  if (!filters || !Object.keys(filters).length) return true;

  for (const [groupId, values] of Object.entries(filters)) {
    if (!values.length) continue;

    const valuesSet = new Set(values.map(String));

    if (groupId === FIELD_FILTER_GROUP_IDS.POSITION) {
      const val = field?.header_item ?? field?.header ?? "";
      if (!valuesSet.has(String(val))) return false;
    } else if (groupId === FIELD_FILTER_GROUP_IDS.CONTENT_TYPE) {
      const val = field?.content_type ?? field?.field_content_type ?? "";
      if (!valuesSet.has(String(val))) return false;
    } else if (groupId === FIELD_FILTER_GROUP_IDS.DATA_TYPE) {
      const val = field?.data_type ?? field?.field_type ?? "";
      if (!valuesSet.has(String(val))) return false;
    }
  }

  return true;
}

export default function DerivedTemplateDetailsPage() {
  const { derivedTemplateId = "" } = useParams();
  const { isMounted } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateQuery = useDerivedTemplate(derivedTemplateId);
  const [fieldSearch, setFieldSearch] = useState("");
  const [fieldFilters, setFieldFilters] = useState<FilterValue>({});

  const tabParam = searchParams.get("tab");
  const activeTab = isTemplateDetailsTab(tabParam) ? tabParam : TEMPLATE_DETAILS_TABS.DETAILS;
  const setActiveTab = useCallback(
    (tab: string) => {
      if (!isTemplateDetailsTab(tab)) return;
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.set("tab", tab);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const backUrl = APP_ROUTES.TEMPLATES + "?tab=derived";

  const template = templateQuery.data;
  const templateFields = useMemo(() => template?.field_membership || [], [template]);
  
  const fieldFilterGroups = useMemo(() => getFieldFilterGroups(templateFields), [templateFields]);
  const filteredTemplateFields = useMemo(() => {
    const search = fieldSearch.trim();
    return templateFields.filter(
      (field: any) =>
        matchesFieldSearch(field, search) &&
        matchesFieldFilters(field, fieldFilters),
    );
  }, [fieldFilters, fieldSearch, templateFields]);
  
  const isFieldFilterActive =
    fieldSearch.trim().length > 0 ||
    Object.values(fieldFilters).some((values: any) => values.length > 0);

  if (!isMounted) {
    return null;
  }

  if (templateQuery.isLoading) {
    return (
      <PageContainers>
        <PageLoader className="min-h-[calc(100svh-10rem)]" />
      </PageContainers>
    );
  }

  return (
    <PageContainers>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
        <PageDescriptiveSection>
          <PageTitle title="Derived Template Details" />
          <PageDescription description={template?.name || derivedTemplateId} />
        </PageDescriptiveSection>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={backUrl}>
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/platform-standard-content/extraction-management/derived/${derivedTemplateId}/edit`}>
              <Edit2 className="size-4 mr-2" />
              Edit Template
            </Link>
          </Button>
        </div>
      </div>

      <Card className="surface-card gap-0 py-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
          <CardHeader className="bg-transparent px-6 pb-0 pt-2 border-b-0">
            <CardTitle className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <TabsList variant="line" className="border-b border-border w-full justify-start [&>button]:flex-none">
                <TabsTrigger
                  value={TEMPLATE_DETAILS_TABS.DETAILS}
                  className="cursor-pointer gap-1.5 px-3"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value={TEMPLATE_DETAILS_TABS.FIELDS}
                  className="cursor-pointer gap-1.5 px-3"
                >
                  Fields
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {templateFields.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              {activeTab === TEMPLATE_DETAILS_TABS.FIELDS ? (
                <FilterDropdown
                  groups={fieldFilterGroups}
                  value={fieldFilters}
                  onValueChange={setFieldFilters}
                >
                  <div className="flex w-full min-w-0 flex-col gap-2 pb-2 md:w-auto md:flex-row md:items-center md:justify-end md:pb-3 p-4">
                    <div className="relative min-w-0 md:w-64">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={fieldSearch}
                        onChange={(event: any) => setFieldSearch(event.target.value)}
                        placeholder="Search fields"
                        aria-label="Search fields"
                        className="h-8 w-full pl-8 pr-8 text-sm"
                      />
                      {fieldSearch ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="absolute right-1 top-1/2 size-6 -translate-y-1/2 text-muted-foreground"
                          aria-label="Clear field search"
                          onClick={() => setFieldSearch("")}
                        >
                          <X className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                    <FilterDropdownTrigger />
                    <FilterDropdownContent />
                  </div>
                </FilterDropdown>
              ) : null}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <TabsContent value={TEMPLATE_DETAILS_TABS.DETAILS} className="m-0 p-6">
               <div className="w-full overflow-hidden rounded-md border border-border bg-card">
                 <DetailGrid cols={3}>
                   <DetailGrid.Item label="Status">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          template?.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                        {template?.is_active ? "Active" : "Inactive"}
                      </span>
                   </DetailGrid.Item>
                   <DetailGrid.Item label="Template Name">
                     <p className="font-semibold text-xs text-foreground truncate" title={template?.name}>
                       {template?.name || "—"}
                     </p>
                   </DetailGrid.Item>
                   <DetailGrid.Item label="Derived Template ID">
                     <p className="font-mono text-xs font-semibold text-foreground truncate" title={template?.derived_template_id}>
                       {template?.derived_template_id || "—"}
                     </p>
                   </DetailGrid.Item>
                   <DetailGrid.Item label="ERP Type">
                     <p className="text-xs font-semibold text-foreground">
                       {template?.erp_type || "—"}
                     </p>
                   </DetailGrid.Item>
                   <DetailGrid.Item label="Document Type Code">
                     <p className="text-xs font-semibold text-foreground">
                       {template?.document_type_code || "—"}
                     </p>
                   </DetailGrid.Item>
                   <DetailGrid.Item label="Version Number">
                     <p className="text-xs font-semibold text-foreground">
                       {template?.version_no || "—"}
                     </p>
                   </DetailGrid.Item>
                   <DetailGrid.Item label="Base Template">
                     <p className="text-xs font-semibold text-foreground">
                       {template?.base_template?.name || "—"}
                     </p>
                   </DetailGrid.Item>
                   <DetailGrid.Item label="Created">
                     <p className="text-xs font-semibold text-foreground">
                       {template?.created_at ? new Date(template.created_at).toLocaleString() : "—"}
                     </p>
                   </DetailGrid.Item>
                   <DetailGrid.Item label="Updated">
                     <p className="text-xs font-semibold text-foreground">
                       {template?.updated_at ? new Date(template.updated_at).toLocaleString() : "—"}
                     </p>
                   </DetailGrid.Item>
                 </DetailGrid>
                 <div className="flex flex-col gap-1.5 border-t border-border/40 bg-card px-4 py-3">
                   <p className="text-xs text-muted-foreground">Description</p>
                   <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                     {template?.description || "No description provided."}
                   </p>
                 </div>
               </div>
            </TabsContent>

            <TabsContent value={TEMPLATE_DETAILS_TABS.FIELDS} className="m-0 p-3 border-0 rounded-xl">
              <FieldsListTable<FieldListTableRecord>
                fields={filteredTemplateFields as FieldListTableRecord[]}
                categories={[]}
                options={{
                  sortable: true,
                  isSortingDisabled: true,
                  showSortSequenceInSubtitle: false,
                }}
                emptyTitle={isFieldFilterActive ? "No matching fields" : "No derived fields assigned"}
                emptyDescription={
                  isFieldFilterActive
                    ? "No fields match the current search or selected filters."
                    : "No fields are currently configured for this derived template."
                }
                className="rounded-md border border-border shadow-none overflow-hidden"
                renderActions={() => null}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </PageContainers>
  );
}

import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useMemo, useCallback, useState } from "react";
import { ExtractionFieldFormDialog } from "../components/extraction-field-form-dialog";
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
import { useExtractionFields } from "@/api/hooks/useExtractionFields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailGrid } from "@/components/ui/detail-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategorizedFieldSelector } from "@/components/ui/categorized-field-selector";

const TEMPLATE_DETAILS_TABS = {
  DETAILS: "details",
  FIELDS: "fields",
} as const;

type TemplateDetailsTab = (typeof TEMPLATE_DETAILS_TABS)[keyof typeof TEMPLATE_DETAILS_TABS];

function isTemplateDetailsTab(value: string | null): value is TemplateDetailsTab {
  return value === TEMPLATE_DETAILS_TABS.DETAILS || value === TEMPLATE_DETAILS_TABS.FIELDS;
}

export default function DerivedTemplateDetailsPage() {
  const { derivedTemplateId = "" } = useParams();
  const { isMounted } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateQuery = useDerivedTemplate(derivedTemplateId);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | undefined>(undefined);

  const handleEditField = (item: any) => {
    setEditingFieldId(item.id);
    setIsFieldDialogOpen(true);
  };

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
  const { data: extractionFields = [] } = useExtractionFields();

  const derivedFields = useMemo(() => {
    return extractionFields.filter(f => {
      const mode = f.field_source_mode?.toUpperCase();
      return mode === "DERIVED" || mode === "BOTH";
    });
  }, [extractionFields]);

  const selectedIds = useMemo(() => {
    return (template?.field_membership || []).flatMap((fm: any) => {
      const val = fm.field_id || fm.field_code || (fm.derived_template_field_id ? fm.derived_template_field_id.split(':').pop() : "");
      return val ? [val] : [];
    });
  }, [template]);

  const knownItems = useMemo(() => {
    const selectedFields = derivedFields.filter(f => selectedIds.includes(f.field_id));
    return selectedFields.map((f: any) => {
      const categoryId = f.field_category?.field_category_code || f.category_code || "uncategorized";
      return {
        id: f.field_id,
        label: f.name || f.field_label || f.field_id,
        description: f.description || f.short_desc || f.field_long_description,
        categoryId: categoryId,
        metadata: {
          type: f.data_type_code || f.data_type?.data_type_code || "",
          position: f.header_item || "Header",
        },
      };
    });
  }, [derivedFields, selectedIds]);

  const categories = useMemo(() => {
    const categoriesMap = new Map<string, any>();
    const selectedFields = derivedFields.filter(f => selectedIds.includes(f.field_id));
    
    selectedFields.forEach((field: any) => {
      if (field.field_category) {
        categoriesMap.set(field.field_category.field_category_code, field.field_category);
      }
    });

    const extractedCategories = Array.from(categoriesMap.values()).map(cat => ({
      id: cat.field_category_code,
      label: cat.ui_label || cat.field_category_code,
      description: cat.description,
      sortOrder: cat.sort_sequence || Number.MAX_SAFE_INTEGER,
      activeFieldCount: selectedFields.filter((f: any) => f.field_category?.field_category_code === cat.field_category_code).length,
    }));

    const uncategorizedCount = selectedFields.filter((f: any) => !f.field_category).length;
    if (uncategorizedCount > 0) {
      extractedCategories.push({
        id: "uncategorized",
        label: "Uncategorized",
        description: "",
        sortOrder: Number.MAX_SAFE_INTEGER,
        activeFieldCount: uncategorizedCount,
      });
    }

    return extractedCategories.sort((a, b) => {
      const sortDifference = a.sortOrder - b.sortOrder;
      return sortDifference || a.label.localeCompare(b.label);
    });
  }, [derivedFields, selectedIds]);

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
                    {selectedIds.length}
                  </span>
                </TabsTrigger>
              </TabsList>
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
              <CategorizedFieldSelector
                categories={categories}
                knownItems={knownItems}
                selectedIds={selectedIds}
                onSelectedChange={() => {}}
                readonly={true}
                onEdit={handleEditField}
                loadCategoryItems={async (category: any) => {
                  const items = knownItems.filter((i: any) => i.categoryId === category.id);
                  return { items, total: items.length };
                }}
                getCategoryItemsQueryKey={(category) => ["derived-items", category.id]}
                loadSearchItems={async (search) => {
                  const s = search.toLowerCase();
                  const items = knownItems.filter(i => 
                    i.label.toLowerCase().includes(s) || 
                    (i.description && i.description.toLowerCase().includes(s))
                  );
                  return { items, total: items.length };
                }}
                getSearchItemsQueryKey={(search) => ["derived-search", search]}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <ExtractionFieldFormDialog
        mode="edit"
        fieldId={editingFieldId}
        open={isFieldDialogOpen}
        onOpenChange={(open) => {
          setIsFieldDialogOpen(open);
          if (!open) {
            setEditingFieldId(undefined);
          }
        }}
      />
    </PageContainers>
  );
}

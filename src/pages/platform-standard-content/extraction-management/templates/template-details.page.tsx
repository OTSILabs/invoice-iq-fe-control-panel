import { PageMetadata } from "@/components/layout/PageMetadata"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useState, 
} from "react";

import type { ApiRecord } from "@/api/api.helpers";
import {
  useCloneTemplate,
  useDeleteTemplate,
  useSetTemplateActive,
  useTemplateByCode,
  useUpdateTemplate,
} from "@/api/templates/templates.hooks";
import { useExtractionFields } from "@/api/hooks/useExtractionFields";
import { EmptyState } from "@/components/invoice-ui/design-system";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { CategorizedFieldSelector } from "@/components/ui/categorized-field-selector";
import type { CategorizedFieldSelectorCategory } from "@/components/ui/categorized-field-selector.utils";
import { ExtractionFieldFormDialog } from "../components/extraction-field-form-dialog";
import {
  buildTemplateUpdatePayload,
  getFieldCode,
  getTemplateCode,
  getTemplateFieldCodes,
  getTemplateIsActive,
  getTemplateIsDefault,
  getTemplateIsEditable,
  getTemplateIsStandard,
  getTemplateName,
  normalizeTemplateDetail,
  resolveTemplateFields,
} from "@/components/invoice-ui/templates/template-data";
import {
  TemplateCloneDialog,
  type CloneTemplateFormValues,
} from "@/components/invoice-ui/templates/template-clone-dialog";
import { TemplateDeleteDialog } from "@/components/invoice-ui/templates/template-delete-dialog";
import { TemplateInformation } from "./components/TemplateInformation";
import { RemoveFieldDialog } from "./components/RemoveFieldDialog";
import { TemplateActiveStateDialog } from "./components/TemplateActiveStateDialog";
import {
  PageDescriptiveSection,
  PageTitle,
  PageDescription,
} from "@/components/invoice-ui/typography";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import { APP_ROUTES } from "@/config/routes-helper";

import {

  TemplateDetailsSkeleton,

} from "./template-details.parts";

const TEMPLATE_DETAILS_TABS = {
  DETAILS: "details",
  FIELDS: "fields",
} as const;

type TemplateDetailsTab =
  (typeof TEMPLATE_DETAILS_TABS)[keyof typeof TEMPLATE_DETAILS_TABS];

function isTemplateDetailsTab(value: string | null): value is TemplateDetailsTab {
  return (
    value === TEMPLATE_DETAILS_TABS.DETAILS ||
    value === TEMPLATE_DETAILS_TABS.FIELDS
  );
}

// --- Module-scope helpers (moved out of component for performance & stability) ---
function getTemplateMembershipFields(tpl: unknown) {
  return resolveTemplateFields(tpl);
}

function TemplateFieldsSection({
  categories,
  knownItems,
  selectedIds,
  onEdit,
}: {
  categories: CategorizedFieldSelectorCategory[];
  knownItems: any[];
  selectedIds: string[];
  onEdit?: (item: any) => void;
}) {
  return (
    <TabsContent value={TEMPLATE_DETAILS_TABS.FIELDS} className="m-0 p-3 border-0 rounded-xl">
      <CategorizedFieldSelector
        categories={categories}
        knownItems={knownItems}
        selectedIds={selectedIds}
        onSelectedChange={() => {}}
        readonly={true}
        onEdit={onEdit}
        loadCategoryItems={async (category: any) => {
          const items = knownItems.filter((i: any) => i.categoryId === category.id);
          return { items, total: items.length };
        }}
        getCategoryItemsQueryKey={(category) => ["template-items", category.id]}
        loadSearchItems={async (search) => {
          const s = search.toLowerCase();
          const items = knownItems.filter(i => 
            i.label.toLowerCase().includes(s) || 
            (i.description && i.description.toLowerCase().includes(s))
          );
          return { items, total: items.length };
        }}
        getSearchItemsQueryKey={(search) => ["template-search", search]}
      />
    </TabsContent>
  );
};

function TemplateDetailsHeader({
  template,
  canManageTemplate,
  editHref,
}: {
  template: unknown;
  canManageTemplate: boolean;
  editHref: string;
  showHeaderCloneAction: boolean;
  setDialogs: React.Dispatch<React.SetStateAction<any>>;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-5 lg:flex-row items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <PageDescriptiveSection>
            <PageTitle title="Template Details" />
            <PageDescription description={getTemplateName(template)} />
          </PageDescriptiveSection>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageTemplate ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={editHref}>
                  <Edit2 className="size-4" data-icon="inline-start" />
                  Edit
                </Link>
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDialogs((prev: any) => ({ ...prev, deleteOpen: true }))}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button> */}
            </>
          ) : null}

          {/* {showHeaderCloneAction ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogs((prev: any) => ({ ...prev, cloneOpen: true }))}
            >
              <Copy className="size-4" data-icon="inline-start" />
              Clone
            </Button>
          ) : null} */}

          <Button variant="outline" size="sm" asChild>
            <Link to={APP_ROUTES.TEMPLATES + "?tab=templates"}>
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}



export default function TemplateDetailsPage() {
  const { templateCode = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMounted } = useUser();
  const [dialogs, setDialogs] = useState<{
    activeStateOpen: boolean;
    cloneOpen: boolean;
    deleteOpen: boolean;
    deletingField: ApiRecord | null;
  }>({
    activeStateOpen: false,
    cloneOpen: false,
    deleteOpen: false,
    deletingField: null,
  });
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | undefined>(undefined);

  const handleEditField = (item: any) => {
    setEditingFieldId(item.id);
    setIsFieldDialogOpen(true);
  };
  const cloneTemplateMutation = useCloneTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const setTemplateActiveMutation = useSetTemplateActive();
  const tabParam = searchParams.get("tab");
  const activeTab = isTemplateDetailsTab(tabParam)
    ? tabParam
    : TEMPLATE_DETAILS_TABS.DETAILS;
  const setActiveTab = useCallback(
    (tab: string) => {
      if (!isTemplateDetailsTab(tab)) {
        return;
      }

      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.set("tab", tab);
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );
  const templateQuery = useTemplateByCode(templateCode);

  const template = useMemo(
    () => normalizeTemplateDetail(templateQuery.data),
    [templateQuery.data],
  );
  const templateFieldCodes = useMemo(
    () => getTemplateFieldCodes(template),
    [template],
  );
  const templateFields = useMemo(
      () => getTemplateMembershipFields(template),
      [template],
  );

  const { data: rawExtractionFields = [] } = useExtractionFields();
  
  const extractionFields = useMemo(() => {
    return rawExtractionFields.filter((f: any) => {
      const mode = f.field_source_mode?.toUpperCase();
      return !mode || mode === "EXTRACTED" || mode === "STANDARD" || mode === "BOTH";
    });
  }, [rawExtractionFields]);

  const selectedIds = useMemo(() => {
    return templateFields.flatMap((f) => {
      const code = getFieldCode(f);
      return code ? [code] : [];
    });
  }, [templateFields]);

  const fieldCategories = useMemo(() => {
    const categoriesMap = new Map<string, any>();
    
    const selectedFields = extractionFields.filter((field) => selectedIds.includes(field.field_id));

    selectedFields.forEach(field => {
      if (field.field_category) {
        categoriesMap.set(field.field_category.field_category_code, field.field_category);
      }
    });

    const extractedCategories = Array.from(categoriesMap.values()).map(cat => ({
      id: cat.field_category_code,
      label: cat.ui_label || cat.field_category_code,
      description: cat.description,
      sortOrder: cat.sort_sequence,
      activeFieldCount: selectedFields.filter(f => f.field_category?.field_category_code === cat.field_category_code).length,
    }));

    return extractedCategories.sort((a, b) => {
      const sortDifference = (a.sortOrder || Number.MAX_SAFE_INTEGER) - (b.sortOrder || Number.MAX_SAFE_INTEGER);
      return sortDifference || a.label.localeCompare(b.label);
    });
  }, [extractionFields, selectedIds]);

  const knownFieldItems = useMemo(() => {
    const fieldByCode = new Map<string, any>();

    extractionFields.forEach((field) => {
      if (selectedIds.includes(field.field_id)) {
        const code = field.field_id;
        if (code && !fieldByCode.has(code)) {
          fieldByCode.set(code, {
            id: field.field_id,
            label: field.field_label || field.field_id,
            description: field.field_long_description || field.short_desc || "",
            categoryId: field.field_category?.field_category_code || "uncategorized",
            metadata: {
              type: field.data_type_code || field.data_type?.data_type_code || "",
              position: field.header_item || "Header",
            },
          });
        }
      }
    });

    return [...fieldByCode.values()];
  }, [extractionFields, selectedIds]);
  const resolvedTemplateCode = getTemplateCode(template) || templateCode;
  const editHref = APP_ROUTES.getRoute(APP_ROUTES.TEMPLATE_EDIT, {
    templateCode: resolvedTemplateCode,
  });
  const canManageTemplate = Boolean(
    resolvedTemplateCode &&
    getTemplateIsEditable(template) &&
    !getTemplateIsDefault(template),
  );
  const isLoading = templateQuery.isLoading;
  const isTemplateAvailable = Object.keys(template).length > 0;
  const isStandardTemplate = getTemplateIsStandard(template);
  const showHeaderCloneAction = !isStandardTemplate;

  const cloneTemplate = (values: CloneTemplateFormValues) => {
    if (!resolvedTemplateCode) {
      return;
    }

    cloneTemplateMutation.mutate(
      {
        templateCode: resolvedTemplateCode,
        data: {
          name: values.name,
          description: values.description || null,
        },
      },
      {
        onSuccess: (response) => {
          const clonedTemplate = normalizeTemplateDetail(response);
          const clonedTemplateCode = getTemplateCode(clonedTemplate);

          if (clonedTemplateCode) {
            navigate(
              APP_ROUTES.getRoute(APP_ROUTES.TEMPLATE_EDIT, {
                templateCode: clonedTemplateCode,
              }),
            );
          }
        },
      },
    );
  };

  const deleteTemplate = () => {
    if (!canManageTemplate || !resolvedTemplateCode) {
      return;
    }

    deleteTemplateMutation.mutate(resolvedTemplateCode, {
      onSuccess: () => navigate(APP_ROUTES.TEMPLATES + "?tab=templates"),
    });
  };

  const removeFieldFromTemplate = () => {
    if (!canManageTemplate || !resolvedTemplateCode || !dialogs.deletingField) {
      return;
    }

    const deletingFieldCode = getFieldCode(dialogs.deletingField);
    const currentFieldCodes = templateFieldCodes.length
      ? templateFieldCodes
      : templateFields.flatMap((field) => {
          const code = getFieldCode(field);
          return code ? [code] : [];
        });

    updateTemplateMutation.mutate(
      {
        templateCode: resolvedTemplateCode,
        data: buildTemplateUpdatePayload(template, {
          fieldCodes: currentFieldCodes.filter(
            (fieldCode) => fieldCode !== deletingFieldCode,
          ),
        }),
      },
      {
        onSuccess: () => setDialogs((prev) => ({ ...prev, deletingField: null })),
      },
    );
  };



  const updateTemplateActiveState = () => {
    if (!canManageTemplate || !resolvedTemplateCode) {
      return;
    }

    setTemplateActiveMutation.mutate(
      {
        templateCode: resolvedTemplateCode,
        data: { is_active: !getTemplateIsActive(template) },
      },
      {
        onSuccess: () => setDialogs((prev) => ({ ...prev, activeStateOpen: false })),
      },
    );
  };

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return <TemplateDetailsSkeleton />;
  }

  if (templateQuery.isError || !isTemplateAvailable) {
    return (
      <PageContainers>
        <EmptyState
          title="Template not found"
          description="The selected template is not available."
          actions={
            <Button variant="outline" asChild>
              <Link to={APP_ROUTES.TEMPLATES + "?tab=templates"}>
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Back to Templates
              </Link>
            </Button>
          }
        />
      </PageContainers>
    );
  }

  return (
    <PageContainers>
      <TemplateDetailsContent
        template={template}
        dialogs={dialogs}
        setDialogs={setDialogs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        editHref={editHref}
        fieldCategories={fieldCategories}
        knownFieldItems={knownFieldItems}
        selectedIds={selectedIds}
        updateTemplateMutation={updateTemplateMutation}
        removeFieldFromTemplate={removeFieldFromTemplate}
        cloneTemplateMutation={cloneTemplateMutation}
        cloneTemplate={cloneTemplate}
        deleteTemplateMutation={deleteTemplateMutation}
        deleteTemplate={deleteTemplate}
        setTemplateActiveMutation={setTemplateActiveMutation}
        updateTemplateActiveState={updateTemplateActiveState}
        options={{
          isStandardTemplate,
          showHeaderCloneAction,
          canManageTemplate,
        }}
        onEditField={handleEditField}
      />

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

function TemplateDetailsContent({
  template,
  dialogs,
  setDialogs,
  activeTab,
  setActiveTab,
  editHref,
  fieldCategories,
  knownFieldItems,
  selectedIds,
  updateTemplateMutation,
  removeFieldFromTemplate,
  cloneTemplateMutation,
  cloneTemplate,
  deleteTemplateMutation,
  deleteTemplate,
  setTemplateActiveMutation,
  updateTemplateActiveState,
  onEditField,
  options,
}: any) {
  const {
    showHeaderCloneAction = false,
    canManageTemplate = false,
  } = options || {};
  return (
    <>
      <PageMetadata title="Template Details" description="Configure invoice extraction fields, schemas, and processing bounds." keywords="template details, template schema" />
      <TemplateDetailsHeader
        template={template}
        canManageTemplate={canManageTemplate}
        editHref={editHref}
        showHeaderCloneAction={showHeaderCloneAction}
        setDialogs={setDialogs}
      />
      {/* {isStandardTemplate ? (
        <Alert className="pr-4 sm:pr-40">
          <Info className="size-4" />
          <AlertTitle>Standard template</AlertTitle>
          <AlertDescription>
            The standard templates are not editable. Clone the template to add
            custom fields or make changes.
          </AlertDescription>
          <AlertAction className="static col-span-full mt-2 flex items-center sm:absolute sm:top-1/2 sm:col-span-1 sm:mt-0 sm:-translate-y-1/2">
            <Button
              type="button"
              size="sm"
              onClick={() => setDialogs((prev: any) => ({ ...prev, cloneOpen: true }))}
            >
              <Copy className="size-4" data-icon="inline-start" />
              Clone
            </Button>
          </AlertAction>
        </Alert>
      ) : null} */}

      <Card className="surface-card gap-0 py-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0 sadcnx">
          <CardHeader className="bg-transparent px-6 pb-0 pt-2 border-b-0">
            <CardTitle className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <TabsList variant="line" className="border-b border-border w-full justify-start [&>button]:flex-none">
                <TabsTrigger
                  value={TEMPLATE_DETAILS_TABS.DETAILS}
                  className="gap-1.5 px-3"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value={TEMPLATE_DETAILS_TABS.FIELDS}
                  className="gap-1.5 px-3"
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
            <TabsContent
              value={TEMPLATE_DETAILS_TABS.DETAILS}
              className="m-0 p-6"
            >
              <TemplateInformation
                template={template}
                canManageTemplate={canManageTemplate}
                isActiveStatePending={setTemplateActiveMutation.isPending}
                onActiveStateChange={() => setDialogs((prev: any) => ({ ...prev, activeStateOpen: true }))}
              />
            </TabsContent>

            <TemplateFieldsSection
              categories={fieldCategories}
              knownItems={knownFieldItems}
              selectedIds={selectedIds}
              onEdit={onEditField}
            />
          </CardContent>
        </Tabs>
      </Card>

      <RemoveFieldDialog
        field={dialogs.deletingField}
        open={!!dialogs.deletingField}
        isPending={updateTemplateMutation.isPending}
        onConfirm={removeFieldFromTemplate}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDialogs((prev: any) => ({ ...prev, deletingField: null }));
          }
        }}
      />

      <TemplateCloneDialog
        template={template}
        open={dialogs.cloneOpen}
        isPending={cloneTemplateMutation.isPending}
        onSubmit={cloneTemplate}
        onOpenChange={(open: boolean) => setDialogs((prev: any) => ({ ...prev, cloneOpen: open }))}
      />

      <TemplateDeleteDialog
        template={template}
        open={dialogs.deleteOpen}
        isPending={deleteTemplateMutation.isPending}
        onConfirm={deleteTemplate}
        onOpenChange={(open: boolean) => setDialogs((prev: any) => ({ ...prev, deleteOpen: open }))}
      />

      <TemplateActiveStateDialog
        template={template}
        open={dialogs.activeStateOpen}
        isPending={setTemplateActiveMutation.isPending}
        onConfirm={updateTemplateActiveState}
        onOpenChange={(open: boolean) => setDialogs((prev: any) => ({ ...prev, activeStateOpen: open }))}
      />
    </>
  );
}
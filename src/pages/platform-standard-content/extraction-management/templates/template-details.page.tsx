import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Edit2,
  Info,
  Search,
  Trash2,
  X,
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
  useUpdateTemplateSortOrder,
} from "@/api/templates/templates.hooks";
import { EmptyState } from "@/components/invoice-ui/design-system";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import {
  FilterDropdown,
  FilterDropdownContent,
  FilterDropdownTrigger,
  type FilterGroup,
  type FilterValue,
} from "@/components/invoice-ui/filter-dropdown";
import {
  FieldsListTable,
  type FieldListTableRecord,
} from "@/components/invoice-ui/templates/fields-list-table";
import {
  buildTemplateUpdatePayload,
  getFieldCode,
  getFieldLabel,
  getTemplateCode,
  getTemplateFieldCodes,
  getTemplateFieldCount,
  getTemplateIsActive,
  getTemplateIsDefault,
  getTemplateIsEditable,
  getTemplateIsStandard,
  getTemplateName,
  normalizeTemplateDetail,
  resolveTemplateFields,
  getFieldShortDescription,
  getFieldLongDescription,
  getFieldExamples,
  getFieldInstructions,
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
} from "@/components/invoice-ui/typography";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

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



const FIELD_FILTER_GROUP_IDS = {
  POSITION: "position",
  CONTENT_TYPE: "content_type",
  DATA_TYPE: "data_type",
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

function TemplateDetailsHeader({
  template,
  canManageTemplate,
  editHref,
  showHeaderCloneAction,
  setDialogs,
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
            <PageTitle title={getTemplateName(template)} />
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDialogs((prev: any) => ({ ...prev, deleteOpen: true }))}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </>
          ) : null}

          {showHeaderCloneAction ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogs((prev: any) => ({ ...prev, cloneOpen: true }))}
            >
              <Copy className="size-4" data-icon="inline-start" />
              Clone
            </Button>
          ) : null}

          <Button variant="outline" size="sm" asChild>
            <Link to={APP_ROUTES.TEMPLATES}>
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TemplateFieldsSection({
  filteredTemplateFields,
  isFieldFilterActive,
  saveSortOrder,
  canManageTemplate,
  editField,
  removeField,
  updateTemplateSortOrderMutation,
}: {
  filteredTemplateFields: FieldListTableRecord[];
  isFieldFilterActive: boolean;
  saveSortOrder: (fieldCodes: string[]) => void;
  canManageTemplate: boolean;
  editField: (f: FieldListTableRecord) => void;
  removeField: (f: FieldListTableRecord) => void;
  updateTemplateSortOrderMutation: any;
}) {
  return (
    <TabsContent value={TEMPLATE_DETAILS_TABS.FIELDS} className="m-0 p-3 border-0 rounded-xl">
      <FieldsListTable<FieldListTableRecord>
        fields={filteredTemplateFields}
        categories={[]}
        options={{
          sortable: true,
          isSortOrderSaving: updateTemplateSortOrderMutation.isPending,
          isSortingDisabled: !canManageTemplate || isFieldFilterActive,
          showSortSequenceInSubtitle: false,
        }}
        emptyTitle={isFieldFilterActive ? "No matching fields" : "No fields assigned"}
        emptyDescription={
          isFieldFilterActive
            ? "No fields match the current search or selected filters."
            : "Add a field to this template to build the extraction schema."
        }
        className="rounded-md border border-border shadow-none overflow-hidden"
        renderActions={({ field }) =>
          canManageTemplate ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="size-7"
                aria-label={`Edit ${getFieldLabel(field)}`}
                onClick={() => editField(field)}
              >
                <Edit2 className="size-3.5" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${getFieldLabel(field)}`}
                onClick={() => removeField(field)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          ) : null
        }
        onSortOrderChange={saveSortOrder}
      />
    </TabsContent>
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
  const [fieldSearch, setFieldSearch] = useState("");
  const [fieldFilters, setFieldFilters] = useState<FilterValue>({});
  const cloneTemplateMutation = useCloneTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const setTemplateActiveMutation = useSetTemplateActive();
  const updateTemplateSortOrderMutation = useUpdateTemplateSortOrder();
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
  
  const fieldFilterGroups = useMemo(
    () => getFieldFilterGroups(templateFields),
    [templateFields],
  );
  const filteredTemplateFields = useMemo(() => {
    const search = fieldSearch.trim();

    return templateFields.filter(
      (field) =>
        matchesFieldSearch(field, search) &&
        matchesFieldFilters(field, fieldFilters),
    );
  }, [fieldFilters, fieldSearch, templateFields]);
  const isFieldFilterActive =
    fieldSearch.trim().length > 0 ||
    Object.values(fieldFilters).some((values: any) => values.length > 0);
  const resolvedTemplateCode = getTemplateCode(template) || templateCode;
  const editHref = APP_ROUTES.getRoute(APP_ROUTES.TEMPLATE_EDIT, {
    templateCode: resolvedTemplateCode,
  });
  const canManageTemplate = Boolean(
    resolvedTemplateCode &&
    !getTemplateIsStandard(template) &&
    getTemplateIsEditable(template) &&
    !getTemplateIsDefault(template),
  );
  const displayedFieldCount =
    getTemplateFieldCount(template) || templateFields.length;
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
      onSuccess: () => navigate(APP_ROUTES.TEMPLATES),
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

  const saveSortOrder = (fieldCodes: string[]) => {
    if (!canManageTemplate || !resolvedTemplateCode || !fieldCodes.length) {
      return;
    }

    updateTemplateSortOrderMutation.mutate({
      templateCode: resolvedTemplateCode,
      fieldCodes,
    });
  };

  const editField = (field: FieldListTableRecord) => {
    const fieldCode = getFieldCode(field);
    if (!resolvedTemplateCode || !fieldCode) return;
    navigate(APP_ROUTES.getRoute(APP_ROUTES.TEMPLATE_FIELD_EDIT, {
      templateCode: resolvedTemplateCode,
      fieldId: fieldCode,
    }));
  };

  const removeField = (field: FieldListTableRecord) => {
    setDialogs((prev) => ({ ...prev, deletingField: field }));
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
              <Link to={APP_ROUTES.TEMPLATES}>
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
        fieldFilterGroups={fieldFilterGroups}
        fieldFilters={fieldFilters}
        setFieldFilters={setFieldFilters}
        fieldSearch={fieldSearch}
        setFieldSearch={setFieldSearch}
        filteredTemplateFields={filteredTemplateFields}
        displayedFieldCount={displayedFieldCount}
        saveSortOrder={saveSortOrder}
        editField={editField}
        removeField={removeField}
        updateTemplateSortOrderMutation={updateTemplateSortOrderMutation}
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
          isFieldFilterActive,
          canManageTemplate,
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
  fieldFilterGroups,
  fieldFilters,
  setFieldFilters,
  fieldSearch,
  setFieldSearch,
  filteredTemplateFields,
  displayedFieldCount,
  saveSortOrder,
  editField,
  removeField,
  updateTemplateSortOrderMutation,
  updateTemplateMutation,
  removeFieldFromTemplate,
  cloneTemplateMutation,
  cloneTemplate,
  deleteTemplateMutation,
  deleteTemplate,
  setTemplateActiveMutation,
  updateTemplateActiveState,
  options,
}: any) {
  const {
    isStandardTemplate = false,
    showHeaderCloneAction = false,
    isFieldFilterActive = false,
    canManageTemplate = false,
  } = options || {};
  return (
    <>
      <TemplateDetailsHeader
        template={template}
        canManageTemplate={canManageTemplate}
        editHref={editHref}
        showHeaderCloneAction={showHeaderCloneAction}
        setDialogs={setDialogs}
      />
      {isStandardTemplate ? (
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
      ) : null}

      <Card className="surface-card gap-0 py-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0 sadcnx">
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
                    {displayedFieldCount}
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
              filteredTemplateFields={filteredTemplateFields as FieldListTableRecord[]}
              isFieldFilterActive={isFieldFilterActive}
              saveSortOrder={saveSortOrder}
              canManageTemplate={canManageTemplate}
              editField={editField}
              removeField={removeField}
              updateTemplateSortOrderMutation={updateTemplateSortOrderMutation}
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

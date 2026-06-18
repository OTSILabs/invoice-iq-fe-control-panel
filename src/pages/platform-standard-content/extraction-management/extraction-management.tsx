import { useReducer, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, RefreshCw, Plus, Edit2, FileText, LayoutGrid, Layers, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { CustomColumnDef } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/search-input";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/layout/PageHeader";
import { useExtractionFields } from "@/api/hooks/useExtractionFields";
import { useExtractionTemplates } from "@/api/hooks/useExtractionTemplates";
import { useDerivedTemplates, useDeleteDerivedTemplate } from "@/api/hooks/useDerivedTemplates";

import type {
  StandardExtractionFieldResponse,
  StandardExtractionTemplateResponse,
  StandardDerivedTemplateResponse
} from "@/types";

import { FieldDialog } from "./models/FieldDialog";
import { TemplateDialog } from "./models/TemplateDialog";
import { DerivedTemplateDialog } from "./models/DerivedTemplateDialog";

interface State {
  activeTab: string;
  searchText: string;
  fieldDialog: { open: boolean; item: StandardExtractionFieldResponse | null };
  templateDialog: { open: boolean; item: StandardExtractionTemplateResponse | null };
  derivedDialog: { open: boolean; item: StandardDerivedTemplateResponse | null };
}

type Action =
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "SET_SEARCH_TEXT"; payload: string }
  | { type: "OPEN_FIELD_DIALOG"; payload: StandardExtractionFieldResponse | null }
  | { type: "CLOSE_FIELD_DIALOG" }
  | { type: "OPEN_TEMPLATE_DIALOG"; payload: StandardExtractionTemplateResponse | null }
  | { type: "CLOSE_TEMPLATE_DIALOG" }
  | { type: "OPEN_DERIVED_DIALOG"; payload: StandardDerivedTemplateResponse | null }
  | { type: "CLOSE_DERIVED_DIALOG" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload, searchText: "" };
    case "SET_SEARCH_TEXT":
      return { ...state, searchText: action.payload };
    case "OPEN_FIELD_DIALOG":
      return { ...state, fieldDialog: { open: true, item: action.payload } };
    case "CLOSE_FIELD_DIALOG":
      return { ...state, fieldDialog: { open: false, item: null } };
    case "OPEN_TEMPLATE_DIALOG":
      return { ...state, templateDialog: { open: true, item: action.payload } };
    case "CLOSE_TEMPLATE_DIALOG":
      return { ...state, templateDialog: { open: false, item: null } };
    case "OPEN_DERIVED_DIALOG":
      return { ...state, derivedDialog: { open: true, item: action.payload } };
    case "CLOSE_DERIVED_DIALOG":
      return { ...state, derivedDialog: { open: false, item: null } };
    default:
      return state;
  }
}

const initialState: State = {
  activeTab: "fields",
  searchText: "",
  fieldDialog: { open: false, item: null },
  templateDialog: { open: false, item: null },
  derivedDialog: { open: false, item: null },
};

export function ExtractionManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") || "fields";
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (urlTab !== state.activeTab) {
      dispatch({ type: "SET_ACTIVE_TAB", payload: urlTab });
    }
  }, [urlTab, state.activeTab]);

  // Loading TanStack query data
  const fieldsQuery = useExtractionFields();
  const templatesQuery = useExtractionTemplates();
  const derivedQuery = useDerivedTemplates();
  const deleteMutation = useDeleteDerivedTemplate();

  // Dialog triggers
  const handleOpenFieldCreate = useCallback(() => dispatch({ type: "OPEN_FIELD_DIALOG", payload: null }), []);
  const handleOpenFieldEdit = useCallback((item: StandardExtractionFieldResponse) => dispatch({ type: "OPEN_FIELD_DIALOG", payload: item }), []);

  const handleOpenTemplateCreate = useCallback(() => dispatch({ type: "OPEN_TEMPLATE_DIALOG", payload: null }), []);
  const handleOpenTemplateEdit = useCallback((item: StandardExtractionTemplateResponse) => dispatch({ type: "OPEN_TEMPLATE_DIALOG", payload: item }), []);

  const handleOpenDerivedCreate = useCallback(() => dispatch({ type: "OPEN_DERIVED_DIALOG", payload: null }), []);
  const handleOpenDerivedEdit = useCallback((item: StandardDerivedTemplateResponse) => dispatch({ type: "OPEN_DERIVED_DIALOG", payload: item }), []);

  // Deletion trigger
  const handleDeleteDerived = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this derived template? This action cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Derived template deleted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || "Failed to delete derived template");
    }
  }, [deleteMutation]);

  // Global Refetch
  const handleRefetch = useCallback(async () => {
    try {
      if (state.activeTab === "fields") await fieldsQuery.refetch();
      else if (state.activeTab === "templates") await templatesQuery.refetch();
      else if (state.activeTab === "derived") await derivedQuery.refetch();
      toast.success("Details refreshed");
    } catch {
      toast.error("Failed to refresh details");
    }
  }, [state.activeTab, fieldsQuery, templatesQuery, derivedQuery]);

  const handleTabChange = useCallback((tab: string) => {
    setSearchParams({ tab });
  }, [setSearchParams]);

  const setSearchText = useCallback((text: string) => {
    dispatch({ type: "SET_SEARCH_TEXT", payload: text });
  }, []);

  // Filtered Data Calculations
  const filteredFields = useMemo(() => {
    const data = fieldsQuery.data || [];
    if (!state.searchText.trim() || state.activeTab !== "fields") return data;
    const query = state.searchText.toLowerCase();
    return data.filter(
      (f) =>
        f.field_id.toLowerCase().includes(query) ||
        f.field_label.toLowerCase().includes(query) ||
        (f.short_desc && f.short_desc.toLowerCase().includes(query))
    );
  }, [fieldsQuery.data, state.searchText, state.activeTab]);

  const filteredTemplates = useMemo(() => {
    const data = templatesQuery.data || [];
    if (!state.searchText.trim() || state.activeTab !== "templates") return data;
    const query = state.searchText.toLowerCase();
    return data.filter(
      (t) =>
        t.template_id.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
    );
  }, [templatesQuery.data, state.searchText, state.activeTab]);

  const filteredDerived = useMemo(() => {
    const data = derivedQuery.data || [];
    if (!state.searchText.trim() || state.activeTab !== "derived") return data;
    const query = state.searchText.toLowerCase();
    return data.filter(
      (d) =>
        d.derived_template_id.toLowerCase().includes(query) ||
        d.template_id.toLowerCase().includes(query) ||
        d.name.toLowerCase().includes(query) ||
        (d.description && d.description.toLowerCase().includes(query))
    );
  }, [derivedQuery.data, state.searchText, state.activeTab]);

  // loading / error states calculation
  const isLoading =
    (state.activeTab === "fields" && fieldsQuery.isLoading) ||
    (state.activeTab === "templates" && templatesQuery.isLoading) ||
    (state.activeTab === "derived" && derivedQuery.isLoading);

  const isFetching =
    (state.activeTab === "fields" && fieldsQuery.isFetching) ||
    (state.activeTab === "templates" && templatesQuery.isFetching) ||
    (state.activeTab === "derived" && derivedQuery.isFetching);

  const isError =
    (state.activeTab === "fields" && fieldsQuery.isError) ||
    (state.activeTab === "templates" && templatesQuery.isError) ||
    (state.activeTab === "derived" && derivedQuery.isError);

  return (
    <div className="flex w-full flex-col gap-6 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Extraction Management"
          description="Configure document layout mappings, extraction fields, and derived templates globally."
        />
      </div>

      <Tabs value={state.activeTab} onValueChange={handleTabChange} className="w-full flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-6 border-0 justify-start">
            <TabsTrigger
              value="fields"
              className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none shadow-none font-semibold text-xs cursor-pointer gap-2 transition-all duration-200"
            >
              <FileText className="size-4" />
              Extraction Fields
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none shadow-none font-semibold text-xs cursor-pointer gap-2 transition-all duration-200"
            >
              <LayoutGrid className="size-4" />
              Base Templates
            </TabsTrigger>
            <TabsTrigger
              value="derived"
              className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none shadow-none font-semibold text-xs cursor-pointer gap-2 transition-all duration-200"
            >
              <Layers className="size-4" />
              Derived Templates
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <SearchInput
              value={state.searchText}
              onChange={setSearchText}
              disabled={isLoading}
              placeholder={`Search ${state.activeTab}...`}
              className="w-full sm:w-64"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefetch}
              className="h-9 w-9 shrink-0 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px"
              disabled={isFetching}
            >
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            </Button>
            {state.activeTab === "fields" && (
              <Button
                size="sm"
                onClick={handleOpenFieldCreate}
                className="font-medium px-3 gap-1 shadow-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Field
              </Button>
            )}
            {state.activeTab === "templates" && (
              <Button
                size="sm"
                onClick={handleOpenTemplateCreate}
                className="font-medium px-3 gap-1 shadow-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Template
              </Button>
            )}
            {state.activeTab === "derived" && (
              <Button
                size="sm"
                onClick={handleOpenDerivedCreate}
                className="font-medium px-3 gap-1 shadow-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" /> Derive Template
              </Button>
            )}
          </div>
        </div>

        {isError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground">Failed to load platform standard content list.</p>
            <Button onClick={handleRefetch} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </div>
        ) : (
          <>
            <TabsContent value="fields" className="m-0 focus:outline-none">
              <FieldsTable
                data={filteredFields}
                isLoading={isLoading || isFetching}
                onEdit={handleOpenFieldEdit}
              />
            </TabsContent>

            <TabsContent value="templates" className="m-0 focus:outline-none">
              <TemplatesTable
                data={filteredTemplates}
                isLoading={isLoading || isFetching}
                onEdit={handleOpenTemplateEdit}
              />
            </TabsContent>

            <TabsContent value="derived" className="m-0 focus:outline-none">
              <DerivedTable
                data={filteredDerived}
                isLoading={isLoading || isFetching}
                onEdit={handleOpenDerivedEdit}
                onDelete={handleDeleteDerived}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Dialog Modals */}
      {state.fieldDialog.open && (
        <FieldDialog
          key={state.fieldDialog.item ? `edit-field-${state.fieldDialog.item.field_id}` : "create-field"}
          open={state.fieldDialog.open}
          onOpenChange={(open) => !open && dispatch({ type: "CLOSE_FIELD_DIALOG" })}
          fieldItem={state.fieldDialog.item}
        />
      )}

      {state.templateDialog.open && (
        <TemplateDialog
          key={state.templateDialog.item ? `edit-temp-${state.templateDialog.item.template_id}` : "create-temp"}
          open={state.templateDialog.open}
          onOpenChange={(open) => !open && dispatch({ type: "CLOSE_TEMPLATE_DIALOG" })}
          templateItem={state.templateDialog.item}
        />
      )}

      {state.derivedDialog.open && (
        <DerivedTemplateDialog
          key={state.derivedDialog.item ? `edit-derived-${state.derivedDialog.item.derived_template_id}` : "create-derived"}
          open={state.derivedDialog.open}
          onOpenChange={(open) => !open && dispatch({ type: "CLOSE_DERIVED_DIALOG" })}
          derivedItem={state.derivedDialog.item}
        />
      )}
    </div>
  );
}

// ── Sub-components for Tables ──

interface FieldsTableProps {
  data: StandardExtractionFieldResponse[];
  isLoading: boolean;
  onEdit: (item: StandardExtractionFieldResponse) => void;
}

function FieldsTable({ data, isLoading, onEdit }: FieldsTableProps) {
  const columns = useMemo<CustomColumnDef<StandardExtractionFieldResponse>[]>(
    () => [
      {
        accessorKey: "field_id",
        header: "Field ID",
        width: "20%",
        minWidth: "120px",
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-foreground truncate block">{row.original.field_id}</span>,
      },
      {
        accessorKey: "field_label",
        header: "Label",
        width: "20%",
        minWidth: "130px",
        cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.field_label}</span>,
      },
      {
        accessorKey: "data_type_code",
        header: "Type",
        width: "120px",
        minWidth: "100px",
        cell: ({ row }) => <Badge variant="outline" className="text-[10px] uppercase font-bold">{row.original.data_type_code}</Badge>,
      },
      {
        accessorKey: "field_category_code",
        header: "Category",
        width: "150px",
        minWidth: "120px",
        cell: ({ row }) => <span className="text-xs text-muted-foreground truncate block">{row.original.field_category_code}</span>,
      },
      {
        accessorKey: "header_item",
        header: "Scope",
        width: "100px",
        minWidth: "80px",
        cell: ({ row }) => {
          const isHeader = row.original.header_item === "header";
          return (
            <Badge variant={isHeader ? "secondary" : "outline"} className={cn("text-[9px] font-semibold px-2 py-0.5 capitalize", isHeader ? "bg-slate-50 text-slate-700 border-slate-200" : "bg-blue-50/50 text-blue-700 border-blue-200")}>
              {row.original.header_item}
            </Badge>
          );
        },
      },
      {
        accessorKey: "allowed_value_mode",
        header: "Value Mode",
        width: "130px",
        minWidth: "110px",
        cell: ({ row }) => <span className="text-xs text-muted-foreground capitalize">{row.original.allowed_value_mode.replace("_", " ")}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        width: "80px",
        minWidth: "80px",
        cell: ({ row }) => (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer" onClick={() => onEdit(row.original)}>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <Card className="rounded-xl border border-border shadow-sm p-0 overflow-hidden">
      <CardContent className="p-0">
        <DataTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          enablePagination
          pageSize={10}
          totalItems={data.length}
          stickyHeader
          fillAvailableHeight
          tableContainerClassName="border-0 rounded-none bg-transparent"
        />
      </CardContent>
    </Card>
  );
}

interface TemplatesTableProps {
  data: StandardExtractionTemplateResponse[];
  isLoading: boolean;
  onEdit: (item: StandardExtractionTemplateResponse) => void;
}

function TemplatesTable({ data, isLoading, onEdit }: TemplatesTableProps) {
  const columns = useMemo<CustomColumnDef<StandardExtractionTemplateResponse>[]>(
    () => [
      {
        accessorKey: "template_id",
        header: "Template ID",
        width: "25%",
        minWidth: "140px",
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-foreground truncate block">{row.original.template_id}</span>,
      },
      {
        accessorKey: "name",
        header: "Name",
        width: "25%",
        minWidth: "150px",
        cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.name}</span>,
      },
      {
        accessorKey: "description",
        header: "Description",
        width: "35%",
        minWidth: "200px",
        cell: ({ row }) => <span className="text-xs text-muted-foreground truncate block max-w-[350px]">{row.original.description || "—"}</span>,
      },
      {
        accessorKey: "field_membership",
        header: "Fields",
        width: "100px",
        minWidth: "80px",
        cell: ({ row }) => {
          const count = row.original.field_membership?.length || 0;
          return (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-700 border border-slate-200">
              {count} {count === 1 ? "field" : "fields"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        width: "80px",
        minWidth: "80px",
        cell: ({ row }) => (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer" onClick={() => onEdit(row.original)}>
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <Card className="rounded-xl border border-border shadow-sm p-0 overflow-hidden">
      <CardContent className="p-0">
        <DataTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          enablePagination
          pageSize={10}
          totalItems={data.length}
          stickyHeader
          fillAvailableHeight
          tableContainerClassName="border-0 rounded-none bg-transparent"
        />
      </CardContent>
    </Card>
  );
}

interface DerivedTableProps {
  data: StandardDerivedTemplateResponse[];
  isLoading: boolean;
  onEdit: (item: StandardDerivedTemplateResponse) => void;
  onDelete: (id: string) => void;
}

function DerivedTable({ data, isLoading, onEdit, onDelete }: DerivedTableProps) {
  const columns = useMemo<CustomColumnDef<StandardDerivedTemplateResponse>[]>(
    () => [
      {
        accessorKey: "derived_template_id",
        header: "Derived ID",
        width: "25%",
        minWidth: "140px",
        cell: ({ row }) => <span className="font-mono text-xs font-semibold text-foreground truncate block">{row.original.derived_template_id}</span>,
      },
      {
        accessorKey: "template_id",
        header: "Base Template ID",
        width: "20%",
        minWidth: "120px",
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground truncate block">{row.original.template_id}</span>,
      },
      {
        accessorKey: "name",
        header: "Name",
        width: "25%",
        minWidth: "150px",
        cell: ({ row }) => <span className="text-xs font-medium text-foreground">{row.original.name}</span>,
      },
      {
        accessorKey: "description",
        header: "Description",
        width: "25%",
        minWidth: "200px",
        cell: ({ row }) => <span className="text-xs text-muted-foreground truncate block max-w-[300px]">{row.original.description || "—"}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        width: "100px",
        minWidth: "100px",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                  <Plus className="h-4 w-4 rotate-45 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => onEdit(row.original)}>
                  <Edit2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  Edit Layout
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-red-600 cursor-pointer focus:text-red-700" onClick={() => onDelete(row.original.derived_template_id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <Card className="rounded-xl border border-border shadow-sm p-0 overflow-hidden">
      <CardContent className="p-0">
        <DataTable
          data={data}
          columns={columns}
          isLoading={isLoading}
          enablePagination
          pageSize={10}
          totalItems={data.length}
          stickyHeader
          fillAvailableHeight
          tableContainerClassName="border-0 rounded-none bg-transparent"
        />
      </CardContent>
    </Card>
  );
}

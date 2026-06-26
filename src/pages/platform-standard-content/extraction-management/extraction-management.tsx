import type { ExtractionManagementState, StandardDerivedTemplateResponse } from "@/types";
import { useReducer, useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AlertCircle, RefreshCw, Plus, FileText, LayoutGrid, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchInput } from "@/components/search-input";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/invoice-ui/design-system";
import { useExtractionFields } from "@/api/hooks/useExtractionFields";
import { useExtractionTemplates } from "@/api/hooks/useExtractionTemplates";
import { useDerivedTemplates, useDeleteDerivedTemplate } from "@/api/hooks/useDerivedTemplates";

import { TemplateCards } from "@/components/invoice-ui/templates/template-cards";
import { FieldsTable } from "./components/fields-table";
import { DerivedTable } from "./components/derived-table";

type Action =
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "SET_SEARCH_TEXT"; payload: string };

function reducer(state: ExtractionManagementState, action: Action): ExtractionManagementState {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload, searchText: "" };
    case "SET_SEARCH_TEXT":
      return { ...state, searchText: action.payload };
    default:
      return state;
  }
}

const initialState: ExtractionManagementState = {
  activeTab: "fields",
  searchText: "",
};

export function ExtractionManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") || "fields";
  const [state, dispatch] = useReducer(reducer, initialState);
  const [deletingDerived, setDeletingDerived] = useState<StandardDerivedTemplateResponse | null>(null);

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

  const handleDeleteDerived = useCallback(async () => {
    if (!deletingDerived) return;
    try {
      await deleteMutation.mutateAsync(deletingDerived.derived_template_id);
      toast.success("Derived template deleted successfully");
      setDeletingDerived(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || "Failed to delete derived template");
    }
  }, [deleteMutation, deletingDerived]);

  const requestDeleteDerived = useCallback((id: string) => {
    const derivedTemplate = derivedQuery.data?.find((item) => item.derived_template_id === id) || null;
    setDeletingDerived(derivedTemplate);
  }, [derivedQuery.data]);

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
    <PageShell>
      <PageHeader
        title="Extraction Management"
        description="Configure document layout mappings, extraction fields, and derived templates globally."
      >
        {state.activeTab === "fields" && (
          <Button
            size="sm"
            onClick={() => navigate("/platform-standard-content/extraction-management/fields/create")}
            className="font-medium px-3 gap-1  transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Field
          </Button>
        )}
        {state.activeTab === "templates" && (
          <Link to="/platform-standard-content/extraction-management/templates/new">
            <Button
              size="sm"
              className="font-medium px-3 gap-1  transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Add Template
            </Button>
          </Link>
        )}
        {state.activeTab === "derived" && (
          <Link to="/platform-standard-content/extraction-management/derived/new">
            <Button
              size="sm"
              className="font-medium px-3 gap-1  transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Derive Template
            </Button>
          </Link>
        )}
      </PageHeader>

      <Tabs value={state.activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList variant="line" className="border-b border-border w-full justify-start  [&>button]:flex-none">
          <TabsTrigger value="fields" className="cursor-pointer gap-1.5">
            <FileText className="size-4" />
            Extraction Fields
          </TabsTrigger>
          <TabsTrigger value="templates" className="cursor-pointer gap-1.5">
            <LayoutGrid className="size-4" />
            Base Templates
          </TabsTrigger>
          <TabsTrigger value="derived" className="cursor-pointer gap-1.5">
            <Layers className="size-4" />
            Derived Templates
          </TabsTrigger>
        </TabsList>

        {isError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
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
                isFetching={isFetching}
                onEdit={(field) => navigate(`/platform-standard-content/extraction-management/fields/${field.field_id}/edit`)}
                searchText={state.searchText}
                onSearchChange={setSearchText}
                onRefresh={handleRefetch}
              />
            </TabsContent>

            <TabsContent value="templates" className="m-0 focus:outline-none flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-1">
                <h3 className="text-xs font-semibold  text-muted-foreground ">
                  Base Templates ({filteredTemplates.length})
                </h3>
                <div className="flex items-center gap-2">
                  <SearchInput
                    value={state.searchText}
                    onChange={setSearchText}
                    disabled={isLoading}
                    placeholder="Search templates..."
                    className="w-full sm:w-64"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefetch}
                    className="h-9 w-9 shrink-0 cursor-pointer"
                    disabled={isFetching}
                  >
                    <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
                  </Button>
                </div>
              </div>
              <TemplateCards templates={filteredTemplates as any} />
            </TabsContent>

            <TabsContent value="derived" className="m-0 focus:outline-none">
              <DerivedTable
                data={filteredDerived}
                isLoading={isLoading || isFetching}
                isFetching={isFetching}
                onDelete={requestDeleteDerived}
                searchText={state.searchText}
                onSearchChange={setSearchText}
                onRefresh={handleRefetch}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      <DeleteDerivedTemplateDialog
        deletingTemplate={deletingDerived}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeletingDerived(null)}
        onConfirm={handleDeleteDerived}
      />
    </PageShell>
  );
}

function DeleteDerivedTemplateDialog({
  deletingTemplate,
  isDeleting,
  onClose,
  onConfirm,
}: {
  deletingTemplate: StandardDerivedTemplateResponse | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!deletingTemplate) return null;

  return (
    <Dialog open={!!deletingTemplate} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Derived Template</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{deletingTemplate.name || deletingTemplate.derived_template_id}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <p className="text-xs text-muted-foreground">
            This permanently removes the derived template configuration and cannot be undone.
          </p>
        </div>
        <DialogFooter className="dialog-form-footer">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" className="cursor-pointer gap-1.5" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

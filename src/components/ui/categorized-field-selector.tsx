import * as React from "react";
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { CategorySection, FieldRow } from "./CategorySection";
import {
  AlertCircle,
  Loader2,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  normalizeLoadResult,
  mergeMatchingItems,
  sortCategories,
  type CategorizedFieldSelectorCategory,
  type CategorizedFieldSelectorItem,
  type CategorizedFieldSelectorLoadResult,
  getSortOrder,
} from "./categorized-field-selector.utils";

export type {
  CategorizedFieldSelectorCategory,
  CategorizedFieldSelectorItem,
  CategorizedFieldSelectorLoadResult,
};

export interface CategorizedFieldSelectorProps {
  categories: CategorizedFieldSelectorCategory[];
  selectedIds: string[];
  onSelectedChange: (selectedIds: string[]) => void;
  onSelectAll?: () => Promise<string[]> | string[];
  onDeselectAll?: () => void;
  loadSearchItems?: (
    search: string,
  ) => Promise<CategorizedFieldSelectorLoadResult | CategorizedFieldSelectorItem[]>;
  getSearchItemsQueryKey?: (search: string) => QueryKey;
  loadCategoryItems: (
    category: CategorizedFieldSelectorCategory,
  ) => Promise<CategorizedFieldSelectorLoadResult | CategorizedFieldSelectorItem[]>;
  getCategoryItemsQueryKey: (
    category: CategorizedFieldSelectorCategory,
  ) => QueryKey;
  knownItems?: CategorizedFieldSelectorItem[];
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: React.ReactNode;
  actions?: React.ReactNode;
  panelHeight?: string;
  className?: string;
  onEdit?: (item: CategorizedFieldSelectorItem) => void;
}

export type CategorySectionProps = {
  category: CategorizedFieldSelectorCategory;
  selectedIds: string[];
  selectedSet: Set<string>;
  search: string;
  knownItems: CategorizedFieldSelectorItem[];
  disabled?: boolean;
  readonly?: boolean;
  loadCategoryItems: CategorizedFieldSelectorProps["loadCategoryItems"];
  getCategoryItemsQueryKey: CategorizedFieldSelectorProps["getCategoryItemsQueryKey"];
  onSelectedChange: (selectedIds: string[]) => void;
  stickyTop: string;
  onEdit?: CategorizedFieldSelectorProps["onEdit"];
};

const EMPTY_KNOWN_ITEMS: CategorizedFieldSelectorItem[] = [];

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function CategorySkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-md border border-border/70 bg-card px-3 py-2.5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-4 rounded" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchResultsSection({
  categories,
  items,
  total,
  selectedIds,
  selectedSet,
  disabled,
  readonly,
  loading,
  error,
  search,
  onSelectedChange,
  onEdit,
}: {
  categories: CategorizedFieldSelectorCategory[];
  items: CategorizedFieldSelectorItem[];
  total?: number;
  selectedIds: string[];
  selectedSet: Set<string>;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  error?: boolean;
  search: string;
  onSelectedChange: (selectedIds: string[]) => void;
  onEdit?: (item: CategorizedFieldSelectorItem) => void;
}) {
  const isLocked = disabled || readonly;
  const categoryById = React.useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const groupedItems = React.useMemo(() => {
    const itemsByCategoryId = new Map<string, CategorizedFieldSelectorItem[]>();

    items.forEach((item) => {
      const categoryId = item.categoryId || "";
      const categoryItems = itemsByCategoryId.get(categoryId) ?? [];

      categoryItems.push(item);
      itemsByCategoryId.set(categoryId, categoryItems);
    });

    return [...itemsByCategoryId.entries()]
      .map(([categoryId, categoryItems]) => ({
        category:
          categoryById.get(categoryId) ??
          ({
            id: categoryId || "uncategorized",
            label: categoryId || "Uncategorized",
          } satisfies CategorizedFieldSelectorCategory),
        items: categoryItems,
      }))
      .sort((a, b) => {
        const categorySortDifference =
          getSortOrder(a.category) - getSortOrder(b.category);

        return (
          categorySortDifference ||
          a.category.label.localeCompare(b.category.label)
        );
      });
  }, [categoryById, items]);

  function toggleItem(itemId: string) {
    const item = items.find((candidate) => candidate.id === itemId);

    if (isLocked || item?.disabled) {
      return;
    }

    if (selectedSet.has(itemId)) {
      onSelectedChange(selectedIds.filter((id) => id !== itemId));
      return;
    }

    onSelectedChange([...selectedIds, itemId]);
  }

  if (loading) {
    return <CategorySkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/35 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        Failed to search fields.
      </div>
    );
  }

  if (!groupedItems.length) {
    return (
      <div className="flex min-h-48 flex-1 items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/20 px-4 text-center">
        <div>
          <p className="text-[13px] font-medium text-foreground">
            No matching fields
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            No fields matched "{search}".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {groupedItems.map(({ category, items: categoryItems }) => {
        return (
          <div
            key={category.id}
            className="overflow-hidden rounded-md border border-border/55 bg-background shadow-none"
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="truncate text-[13px] font-semibold leading-5 text-foreground">
                    {category.label}
                  </span>
                </div>
                {category.description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {category.description}
                  </p>
                ) : null}
              </div>
            </div>
            <ul className="grid gap-1.5 bg-muted/15 p-3 list-none" aria-label={`${category.label} search results`}>
              {categoryItems.map((item) => (
                <FieldRow
                  key={item.id}
                  item={item}
                  selected={selectedSet.has(item.id)}
                  disabled={isLocked || item.disabled}
                  onToggle={toggleItem}
                  onEdit={onEdit}
                  readonly={readonly}
                />
              ))}
            </ul>
          </div>
        );
      })}
      {typeof total === "number" && total > items.length ? (
        <p className="px-1 text-xs text-muted-foreground">
          Showing {items.length} of {total} matching fields.
        </p>
      ) : null}
    </div>
  );
}

function UncategorizedSelectedSection({
  items,
  selectedIds,
  selectedSet,
  disabled,
  readonly,
  onSelectedChange,
  onEdit,
}: {
  items: CategorizedFieldSelectorItem[];
  selectedIds: string[];
  selectedSet: Set<string>;
  disabled?: boolean;
  readonly?: boolean;
  onSelectedChange: (selectedIds: string[]) => void;
  onEdit?: (item: CategorizedFieldSelectorItem) => void;
}) {
  const selectedItems = items.filter((item) => selectedSet.has(item.id));

  if (!selectedItems.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border border-border/80 bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold leading-5 text-foreground">
            Selected Fields
          </div>
          <p className="text-xs text-muted-foreground">
            Field category details are not available yet.
          </p>
        </div>
        <Badge variant="secondary" className="h-5 text-[10px]">
          {selectedItems.length} selected
        </Badge>
      </div>
      <div className="grid gap-1.5 bg-muted/15 p-3">
        {selectedItems.map((item) => (
          <FieldRow
            key={item.id}
            item={item}
            selected
            disabled={disabled || readonly || item.disabled}
            onToggle={(itemId) =>
              onSelectedChange(selectedIds.filter((id) => id !== itemId))
            }
            onEdit={onEdit}
            readonly={readonly}
          />
        ))}
      </div>
    </div>
  );
}

type SearchOptions = {
  canSearchFields: boolean;
  isSearchInputDisabled: boolean;
  isSearchMode: boolean;
  isSearchQueryFetching: boolean;
};

type BulkOptions = {
  onSelectAll?: () => Promise<string[]> | string[];
  isBulkCheckboxDisabled: boolean;
  bulkCheckboxChecked: boolean | "indeterminate";
  allFieldsSelected: boolean;
  handleDeselectAll: () => void;
  handleSelectAll: () => void;
  someFieldsSelected: boolean;
  bulkAction: "select-all" | "deselect-all" | null;
  bulkSelectionLabel: string;
  selectedIdsLength: number;
  totalActiveFieldCount: number;
};

interface SelectorHeaderProps {
  searchId: string;
  search: string;
  setSearch: (val: string) => void;
  searchOptions: SearchOptions;
  bulkOptions: BulkOptions;
  actions?: React.ReactNode;
  isPending: boolean;
}

function CategorizedFieldSelectorHeader(
  { searchId, search, setSearch, searchOptions, bulkOptions, actions, ref, }: SelectorHeaderProps & { ref?: React.Ref<HTMLDivElement> },
) {
  return (
    <div
      ref={ref as any}
      className="sticky top-0 z-20 flex flex-col gap-3 rounded-t-md border-b border-border/80 bg-card/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:flex-row sm:items-center sm:justify-between"
    >
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-semibold leading-5 text-foreground">
            Fields
          </h3>
          <p className="text-xs text-muted-foreground">
            {bulkOptions.selectedIdsLength} fields selected
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          {searchOptions.canSearchFields ? (
            <div className="relative min-w-0">
              <label htmlFor={searchId} className="sr-only">
                Search fields
              </label>
              <Search
                className="pointer-events-none absolute left-2 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={searchId}
                value={search}
                disabled={searchOptions.isSearchInputDisabled}
                placeholder="Search fields..."
                className="h-8 w-full pl-7 pr-12 text-xs sm:w-56"
                onChange={(event) => setSearch(event.target.value)}
              />
              {searchOptions.isSearchMode && searchOptions.isSearchQueryFetching ? (
                <Loader2
                  className="pointer-events-none absolute right-7 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              ) : null}
              {search ? (
                <button
                  type="button"
                  aria-label="Clear field search"
                  disabled={searchOptions.isSearchInputDisabled}
                  className="absolute right-1 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setSearch("")}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : null}
              {bulkOptions.onSelectAll ? (
            <label
              className={cn(
                "flex h-7 shrink-0 items-center gap-2 rounded-sm px-1.5 text-xs font-medium text-muted-foreground transition-colors",
                !bulkOptions.isBulkCheckboxDisabled &&
                "cursor-pointer hover:bg-muted/45 hover:text-foreground",
                bulkOptions.isBulkCheckboxDisabled && "cursor-not-allowed",
                bulkOptions.isBulkCheckboxDisabled &&
                !bulkOptions.allFieldsSelected &&
                !bulkOptions.someFieldsSelected &&
                "text-muted-foreground/50",
              )}
              title={`${bulkOptions.selectedIdsLength} of ${bulkOptions.totalActiveFieldCount} active fields selected`}
            >
              <Checkbox
                checked={bulkOptions.bulkCheckboxChecked}
                disabled={
                    bulkOptions.isBulkCheckboxDisabled &&
                    !bulkOptions.allFieldsSelected &&
                    !bulkOptions.someFieldsSelected
                }
                aria-disabled={bulkOptions.isBulkCheckboxDisabled}
                aria-label="Toggle all fields"
                onCheckedChange={() => {
                  if (bulkOptions.allFieldsSelected) {
                    bulkOptions.handleDeselectAll();
                    return;
                  }

                  void bulkOptions.handleSelectAll();
                }}
                onClick={(event) => event.stopPropagation()}
                className={cn(
                  "size-3.5 rounded-[5px] disabled:opacity-100 group-has-disabled/field:opacity-100 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-amber-400 data-[state=indeterminate]:bg-amber-400 data-[state=indeterminate]:text-white",
                  bulkOptions.someFieldsSelected &&
                  "border-amber-400 text-amber-800 dark:border-amber-500 dark:text-amber-200",
                )}
              />
              {bulkOptions.bulkAction === "select-all" ? (
                <Loader2
                  className="size-3.5 shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : null}
              <span className="whitespace-nowrap">{bulkOptions.bulkSelectionLabel}</span>
              <span
                className="tabular-nums opacity-80"
                aria-label={`${bulkOptions.selectedIdsLength} of ${bulkOptions.totalActiveFieldCount} active fields selected`}
              >
                {bulkOptions.selectedIdsLength}/{bulkOptions.totalActiveFieldCount}
              </span>
            </label>
          ) : null}
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
    );
  }
CategorizedFieldSelectorHeader.displayName = "CategorizedFieldSelectorHeader";

interface CategorizedFieldSelectorBodyProps {
  isSearchMode: boolean;
  sortedCategories: any[];
  searchItems: any[];
  searchTotal: number;
  selectedIds: string[];
  selectedSet: Set<string>;
  disabled: boolean;
  readonly: boolean;
  isSearchLoading: boolean;
  isSearchQueryError: boolean;
  normalizedSearch: string;
  onSelectedChange: (ids: string[]) => void;
  onEdit?: (item: any) => void;
  loading: boolean;
  knownItems: any[];
  loadCategoryItems: any;
  getCategoryItemsQueryKey: any;
  categoryStickyTop: string;
  uncategorizedSelectedItems: any[];
  isBulkProcessing: boolean;
  search: string;
}

function CategorizedFieldSelectorBody({
  isSearchMode,
  sortedCategories,
  searchItems,
  searchTotal,
  selectedIds,
  selectedSet,
  disabled,
  readonly,
  isSearchLoading,
  isSearchQueryError,
  normalizedSearch,
  onSelectedChange,
  onEdit,
  loading,
  knownItems,
  loadCategoryItems,
  getCategoryItemsQueryKey,
  categoryStickyTop,
  uncategorizedSelectedItems,
  isBulkProcessing,
  search,
}: CategorizedFieldSelectorBodyProps) {
  return (
    <div className="flex min-h-full flex-col gap-2 p-3">
      {isSearchMode ? (
        <SearchResultsSection
          categories={sortedCategories}
          items={searchItems}
          total={searchTotal}
          selectedIds={selectedIds}
          selectedSet={selectedSet}
          disabled={disabled || isBulkProcessing}
          readonly={readonly}
          loading={isSearchLoading}
          error={isSearchQueryError}
          search={normalizedSearch}
          onSelectedChange={onSelectedChange}
          onEdit={onEdit}
        />
      ) : loading ? (
        <CategorySkeleton />
      ) : sortedCategories.length ? (
        <>
          {sortedCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              selectedIds={selectedIds}
              selectedSet={selectedSet}
              search={search}
              knownItems={knownItems}
              disabled={disabled || isBulkProcessing}
              readonly={readonly}
              loadCategoryItems={loadCategoryItems}
              getCategoryItemsQueryKey={getCategoryItemsQueryKey}
              onSelectedChange={onSelectedChange}
              stickyTop={categoryStickyTop}
              onEdit={onEdit}
            />
          ))}

          <UncategorizedSelectedSection
            items={uncategorizedSelectedItems}
            selectedIds={selectedIds}
            selectedSet={selectedSet}
            disabled={disabled}
            readonly={readonly}
            onSelectedChange={onSelectedChange}
            onEdit={onEdit}
          />
        </>
      ) : (
        <div className="flex min-h-48 flex-1 items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/20 px-4 text-center">
          <div>
            <p className="text-[13px] font-medium text-foreground">
              No field categories
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Categories will appear here when they are available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CategorizedFieldSelector({
  categories,
  selectedIds,
  onSelectedChange,
  onSelectAll,
  onDeselectAll,
  loadSearchItems,
  getSearchItemsQueryKey,
  loadCategoryItems,
  getCategoryItemsQueryKey,
  knownItems = EMPTY_KNOWN_ITEMS,
  disabled = false,
  readonly = false,
  loading = false,
  error,
  helperText,
  actions,
  panelHeight,
  className,
  onEdit,
}: CategorizedFieldSelectorProps) {
  const [search, setSearch] = React.useState("");
  const headerRef = React.useRef<HTMLDivElement>(null);
  const searchId = React.useId();
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [bulkAction, setBulkAction] = React.useState<
    "select-all" | "deselect-all" | null
  >(null);
  const [bulkError, setBulkError] = React.useState("");
  const normalizedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(normalizedSearch, 250);
  const canSearchFields = Boolean(loadSearchItems);
  const isSearchMode = canSearchFields && normalizedSearch.length > 0;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const sortedCategories = React.useMemo(
    () => sortCategories(categories),
    [categories],
  );
  const categoryIds = React.useMemo(
    () => new Set(sortedCategories.map((category) => category.id)),
    [sortedCategories],
  );
  const uncategorizedSelectedItems = React.useMemo(
    () =>
      knownItems.filter(
        (item) =>
          selectedSet.has(item.id) &&
          (!item.categoryId || !categoryIds.has(item.categoryId)),
      ),
    [categoryIds, knownItems, selectedSet],
  );
  const isBulkProcessing = bulkAction !== null;
  const isLocked = disabled || readonly || loading || isBulkProcessing;
  const isSearchInputDisabled = disabled || loading || isBulkProcessing;
  const categoryStickyTop = panelHeight ? "0px" : `${headerHeight}px`;
  const {
    data: searchData,
    isLoading: isSearchQueryLoading,
    isError: isSearchQueryError,
    isFetching: isSearchQueryFetching,
  } = useQuery({
    queryKey:
      getSearchItemsQueryKey?.(debouncedSearch) ??
      ["categorized-field-selector", "search", debouncedSearch],
    queryFn: async () => {
      if (!loadSearchItems) {
        return { items: [] };
      }

      return normalizeLoadResult(await loadSearchItems(debouncedSearch));
    },
    enabled: canSearchFields && debouncedSearch.length > 0,
  });
  const searchItems = React.useMemo(
    () => mergeMatchingItems(searchData?.items ?? [], knownItems),
    [knownItems, searchData?.items],
  );
  const searchTotal = searchData?.total ?? searchItems.length;
  const isSearchLoading =
    isSearchMode &&
    (normalizedSearch !== debouncedSearch || isSearchQueryLoading);
  const totalActiveFieldCount = React.useMemo(
    () =>
      categories.reduce(
        (total, category) =>
          total +
          (typeof category.activeFieldCount === "number"
            ? category.activeFieldCount
            : 0),
        0,
      ),
    [categories],
  );
  const allFieldsSelected =
    totalActiveFieldCount > 0 && selectedIds.length >= totalActiveFieldCount;
  const someFieldsSelected = selectedIds.length > 0 && !allFieldsSelected;
  const bulkCheckboxChecked = allFieldsSelected
    ? true
    : someFieldsSelected
      ? "indeterminate"
      : false;
  const bulkSelectionLabel = bulkAction
    ? "Selecting..."
    : allFieldsSelected
      ? "All Selected"
      : someFieldsSelected
        ? "Selected"
        : "Nothing Selected";
  const isBulkCheckboxDisabled =
    isLocked ||
    (!selectedIds.length && !categories.length) ||
    (!selectedIds.length && totalActiveFieldCount <= 0);

  React.useLayoutEffect(() => {
    if (panelHeight) {
      return;
    }

    const headerElement = headerRef.current;

    if (!headerElement) {
      return;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(headerElement.getBoundingClientRect().height);
    };
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateHeaderHeight);

    updateHeaderHeight();
    resizeObserver?.observe(headerElement);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [panelHeight]);

  async function handleSelectAll() {
    if (!onSelectAll || isLocked) {
      return;
    }

    setBulkAction("select-all");
    setBulkError("");

    try {
      const nextSelectedIds = await onSelectAll();

      onSelectedChange(nextSelectedIds);
    } catch {
      setBulkError("Failed to select all fields.");
    } finally {
      setBulkAction(null);
    }
  }

  function handleDeselectAll() {
    if (isLocked) {
      return;
    }

    setBulkAction("deselect-all");
    setBulkError("");
    onDeselectAll?.();
    onSelectedChange([]);
    setBulkAction(null);
  }

  const selectorBody = (
    <CategorizedFieldSelectorBody
      isSearchMode={isSearchMode}
      sortedCategories={sortedCategories}
      searchItems={searchItems}
      searchTotal={searchTotal}
      selectedIds={selectedIds}
      selectedSet={selectedSet}
      disabled={disabled}
      readonly={readonly}
      isSearchLoading={isSearchLoading}
      isSearchQueryError={isSearchQueryError}
      normalizedSearch={normalizedSearch}
      onSelectedChange={onSelectedChange}
      onEdit={onEdit}
      loading={loading}
      knownItems={knownItems}
      loadCategoryItems={loadCategoryItems}
      getCategoryItemsQueryKey={getCategoryItemsQueryKey}
      categoryStickyTop={categoryStickyTop}
      uncategorizedSelectedItems={uncategorizedSelectedItems}
      isBulkProcessing={isBulkProcessing}
      search={search}
    />
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "rounded-md border border-border/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          panelHeight && "overflow-hidden",
          error && "border-destructive/35",
        )}
      >
        <CategorizedFieldSelectorHeader
          ref={headerRef}
          searchId={searchId}
          search={search}
          setSearch={setSearch}
          searchOptions={{
            canSearchFields,
            isSearchInputDisabled,
            isSearchMode,
            isSearchQueryFetching,
          }}
          bulkOptions={{
            onSelectAll,
            isBulkCheckboxDisabled,
            bulkCheckboxChecked,
            allFieldsSelected,
            handleDeselectAll,
            handleSelectAll,
            someFieldsSelected,
            bulkAction,
            bulkSelectionLabel,
            selectedIdsLength: selectedIds.length,
            totalActiveFieldCount,
          }}
          actions={actions}
          isPending={isLocked}
        />

        {panelHeight ? (
          <ScrollArea
            className={cn(
              "min-h-0 [&_[data-slot=scroll-area-viewport]>div]:!h-full",
              panelHeight,
            )}
          >
            {selectorBody}
          </ScrollArea>
        ) : (
          selectorBody
        )}
      </div>

      {error || bulkError ? (
        <div
          aria-live="polite"
          className="flex min-h-5 items-center gap-1.5 text-xs leading-5 text-destructive"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error || bulkError}
        </div>
      ) : helperText ? (
        <div className="min-h-5 text-xs leading-5 text-muted-foreground">
          {helperText}
        </div>
      ) : null}
    </div>
  );
}

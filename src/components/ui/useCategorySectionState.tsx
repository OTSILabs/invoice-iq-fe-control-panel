import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import {
  normalizeLoadResult,
  sameId,
  mergeItems,
  getInitialItemOrder,
  arraysEqual,
  orderItems,
  filterItems,
  insertCategorySelectedId,
  mergeCategorySelectedIds,
  replaceCategorySelectedIds,
} from "./categorized-field-selector.utils";

export function useCategorySectionState({
  category,
  selectedIds,
  knownItems,
  search,
  loadCategoryItems,
  getCategoryItemsQueryKey,
  disabled,
  readonly,
  onSelectedChange,
}: {
  category: any;
  selectedIds: string[];
  knownItems: any[];
  search: string;
  loadCategoryItems: (c: any) => Promise<any>;
  getCategoryItemsQueryKey: (c: any) => readonly unknown[];
  disabled?: boolean;
  readonly?: boolean;
  onSelectedChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [orderedItemIds, setOrderedItemIds] = React.useState<string[]>([]);
  const [categoryBulkAction, setCategoryBulkAction] = React.useState<"select-all" | "deselect-all" | null>(null);

  const {
    data: categoryData,
    isSuccess: isCategorySuccess,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    refetch: refetchCategory,
  } = useQuery({
    queryKey: getCategoryItemsQueryKey(category),
    queryFn: async () => normalizeLoadResult(await loadCategoryItems(category)),
    enabled: open,
  });

  const categoryKnownItems = React.useMemo(
    () => knownItems.filter((item) => sameId(item.categoryId, category.id)),
    [category.id, knownItems],
  );

  const items = React.useMemo(
    () => mergeItems(categoryData?.items ?? [], categoryKnownItems),
    [categoryKnownItems, categoryData?.items],
  );

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!items.length) {
        setOrderedItemIds([]);
        return;
      }

      setOrderedItemIds((currentItemIds) => {
        if (!currentItemIds.length) {
          return getInitialItemOrder(items, selectedIds);
        }

        const itemIds = items.map((item) => item.id);
        const itemIdSet = new Set(itemIds);
        const nextItemIds = currentItemIds.filter((id) => itemIdSet.has(id));
        const nextItemIdSet = new Set(nextItemIds);

        itemIds.forEach((id) => {
          if (!nextItemIdSet.has(id)) {
            nextItemIds.push(id);
          }
        });

        return arraysEqual(currentItemIds, nextItemIds) ? currentItemIds : nextItemIds;
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [items, selectedIds]);

  const orderedItems = React.useMemo(() => orderItems(items, orderedItemIds), [items, orderedItemIds]);
  const itemById = React.useMemo(() => new Map(orderedItems.map((item) => [item.id, item])), [orderedItems]);
  const categoryItemIds = React.useMemo(() => orderedItems.map((item) => item.id), [orderedItems]);
  const selectedIdsSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedInCategory = selectedIds.filter((id) => itemById.has(id));
  const visibleItems = filterItems(orderedItems, search);
  const sortableItemIds = visibleItems.map((item) => item.id);
  const selectableItems = orderedItems.filter((item) => !item.disabled);
  const selectableItemIds = selectableItems.map((item) => item.id);

  const knownSelectedSet = React.useMemo(() => {
    const set = new Set<string>();
    for (const item of knownItems) {
      if (sameId(item.categoryId, category.id)) {
        set.add(item.id);
      }
    }
    return set;
  }, [category.id, knownItems]);

  const fieldTotal = category.activeFieldCount ?? categoryData?.total ?? (isCategorySuccess ? items.length : null);
  const selectedCount = selectedInCategory.length || selectedIds.filter((id) => knownSelectedSet.has(id)).length;
  const categorySelectionTotal = selectableItemIds.length || fieldTotal || selectedCount || 0;
  const selectedSelectableCount = selectableItemIds.length ? selectableItemIds.filter((id) => selectedIdsSet.has(id)).length : selectedCount;
  const allCategorySelected = categorySelectionTotal > 0 && selectedSelectableCount >= categorySelectionTotal;
  const someCategorySelected = selectedSelectableCount > 0 && !allCategorySelected;
  const categoryCheckboxChecked: boolean | "indeterminate" = allCategorySelected ? true : someCategorySelected ? "indeterminate" : false;
  const isLocked = Boolean(disabled || readonly || categoryBulkAction !== null);
  const hasCategorySelectionTargets = selectedCount > 0 || (isCategorySuccess ? selectableItemIds.length > 0 : fieldTotal !== 0);
  const isCategorySelectionDisabled = isLocked || category.disabled || !hasCategorySelectionTargets;
  const categorySelectionLabel = categoryBulkAction ? "Selecting..." : allCategorySelected ? "All Selected" : someCategorySelected ? "Selected" : "Select all";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function toggleItem(itemId: string) {
    const item = itemById.get(itemId);

    if (isLocked || category.disabled || item?.disabled) {
      return;
    }

    if (selectedIds.includes(itemId)) {
      const nextSelectedIds = selectedIds.filter((id) => id !== itemId);

      if (!arraysEqual(selectedIds, nextSelectedIds)) {
        onSelectedChange(nextSelectedIds);
      }

      return;
    }

    const nextSelectedIds = insertCategorySelectedId(selectedIds, categoryItemIds, itemId);

    if (!arraysEqual(selectedIds, nextSelectedIds)) {
      onSelectedChange(nextSelectedIds);
    }
  }

  async function getItemsForCategorySelection() {
    if (isCategorySuccess) {
      return orderedItems;
    }

    const result = await refetchCategory();
    const normalized = result?.data ? normalizeLoadResult(result.data) : { items: [] };

    const nextItems = mergeItems(normalized.items, categoryKnownItems);
    const nextOrderedItems = orderItems(nextItems, orderedItemIds);

    setOrderedItemIds(nextOrderedItems.map((item) => item.id));

    return nextOrderedItems;
  }

  async function toggleCategorySelection() {
    if (isCategorySelectionDisabled) {
      return;
    }

    const action = allCategorySelected ? "deselect-all" : "select-all";

    setCategoryBulkAction(action);

    try {
      const selectionItems = await getItemsForCategorySelection();
      const selectionItemIds = selectionItems.map((item) => item.id);

      const selectionSelectableItemIds: string[] = [];
      for (const item of selectionItems) {
        if (!item.disabled) {
          selectionSelectableItemIds.push(item.id);
        }
      }

      const selectionItemIdSet = new Set(selectionItemIds);
      const nextSelectedSet = new Set(selectedIds.filter((id) => selectionItemIdSet.has(id)));
      let nextSelectedIds: string[];

      if (action === "deselect-all") {
        selectionSelectableItemIds.forEach((id) => nextSelectedSet.delete(id));

        nextSelectedIds = selectedIds.filter((id) => !selectionItemIdSet.has(id) || nextSelectedSet.has(id));
      } else {
        selectionSelectableItemIds.forEach((id) => nextSelectedSet.add(id));
        const nextCategorySelectedIds = selectionItemIds.filter((id) => nextSelectedSet.has(id));

        nextSelectedIds = mergeCategorySelectedIds(selectedIds, selectionItemIds, nextCategorySelectedIds);
      }

      if (!arraysEqual(selectedIds, nextSelectedIds)) {
        onSelectedChange(nextSelectedIds);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCategoryBulkAction(null);
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedItemIds((currentItemIds) => {
      const oldIndex = currentItemIds.indexOf(String(active.id));
      const newIndex = currentItemIds.indexOf(String(over.id));

      if (oldIndex < 0 || newIndex < 0) {
        return currentItemIds;
      }

      const nextItemIds = [...currentItemIds];
      nextItemIds.splice(oldIndex, 1);
      nextItemIds.splice(newIndex, 0, String(active.id));

      const nextSelectedIds = replaceCategorySelectedIds(selectedIds, categoryItemIds, nextItemIds.filter((id) => selectedIdsSet.has(id)));

      if (!arraysEqual(selectedIds, nextSelectedIds)) {
        onSelectedChange(nextSelectedIds);
      }

      return nextItemIds;
    });
  }

  return {
    open,
    setOpen,
    orderedItemIds,
    setOrderedItemIds,
    categoryBulkAction,
    setCategoryBulkAction,
    categoryData,
    isCategorySuccess,
    isCategoryLoading,
    isCategoryError,
    refetchCategory,
    categoryKnownItems,
    items,
    orderedItems,
    itemById,
    categoryItemIds,
    selectedInCategory,
    visibleItems,
    sortableItemIds,
    selectableItems,
    selectableItemIds,
    knownSelectedSet,
    fieldTotal,
    selectedCount,
    categorySelectionTotal,
    selectedSelectableCount,
    allCategorySelected,
    someCategorySelected,
    categoryCheckboxChecked,
    isLocked,
    hasCategorySelectionTargets,
    isCategorySelectionDisabled,
    categorySelectionLabel,
    sensors,
    toggleItem,
    getItemsForCategorySelection,
    toggleCategorySelection,
    handleDragEnd,
  };
}

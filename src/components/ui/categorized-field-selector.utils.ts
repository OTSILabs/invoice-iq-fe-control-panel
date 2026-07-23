import type {
  CategorizedFieldSelectorCategory,
  CategorizedFieldSelectorItemDetails,
  CategorizedFieldSelectorItem,
  CategorizedFieldSelectorLoadResult,
} from "@/types";

export type {
  CategorizedFieldSelectorCategory,
  CategorizedFieldSelectorItemDetails,
  CategorizedFieldSelectorItem,
  CategorizedFieldSelectorLoadResult,
};

export function normalizeLoadResult(
  result: CategorizedFieldSelectorLoadResult | CategorizedFieldSelectorItem[],
) {
  return Array.isArray(result) ? { items: result } : result;
}

export function getSortOrder(category: CategorizedFieldSelectorCategory) {
  return typeof category.sortOrder === "number"
    ? category.sortOrder
    : Number.MAX_SAFE_INTEGER;
}

export function sortCategories(categories: CategorizedFieldSelectorCategory[]) {
  return categories.toSorted((a, b) => {
    const sortDifference = getSortOrder(a) - getSortOrder(b);

    return sortDifference || a.label.localeCompare(b.label);
  });
}

export function sameId(value: unknown, id: string) {
  return typeof value === "string" && value === id;
}

export function mergeItems(
  loadedItems: CategorizedFieldSelectorItem[],
  knownItems: CategorizedFieldSelectorItem[],
): CategorizedFieldSelectorItem[] {
  const knownById = new Map(knownItems.map((item) => [item.id, item]));
  const mergedIds = new Set<string>();
  const mergedItems: CategorizedFieldSelectorItem[] = loadedItems.map((item) => {
    mergedIds.add(item.id);

    return {
      ...knownById.get(item.id),
      ...item,
      metadata: {
        ...knownById.get(item.id)?.metadata,
        ...item.metadata,
      },
      details: {
        ...knownById.get(item.id)?.details,
        ...item.details,
      },
    };
  });

  knownItems.forEach((item) => {
    if (!mergedIds.has(item.id)) {
      mergedItems.push(item);
    }
  });

  return mergedItems;
}

export function mergeMatchingItems(
  loadedItems: CategorizedFieldSelectorItem[],
  knownItems: CategorizedFieldSelectorItem[],
): CategorizedFieldSelectorItem[] {
  const knownById = new Map(knownItems.map((item) => [item.id, item]));

  return loadedItems.map((item) => ({
    ...knownById.get(item.id),
    ...item,
    metadata: {
      ...knownById.get(item.id)?.metadata,
      ...item.metadata,
    },
    details: {
      ...knownById.get(item.id)?.details,
      ...item.details,
    },
  }));
}

function getItemSearchText(item: CategorizedFieldSelectorItem) {
  return [
    item.label,
    item.description,
    item.metadata?.position,
    item.metadata?.type,
    item.metadata?.contentType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterItems(items: CategorizedFieldSelectorItem[], search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return items;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedQuery);

  return items.filter((item) => regex.test(getItemSearchText(item)));
}

export function arraysEqual(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export function getInitialItemOrder(
  items: CategorizedFieldSelectorItem[],
  selectedIds: string[],
) {
  const itemIds = items.map((item) => item.id);
  const itemIdSet = new Set(itemIds);
  const selectedItemIds = selectedIds.filter((id) => itemIdSet.has(id));
  const selectedItemIdSet = new Set(selectedItemIds);

  return [
    ...selectedItemIds,
    ...itemIds.filter((id) => !selectedItemIdSet.has(id)),
  ];
}

export function orderItems(
  items: CategorizedFieldSelectorItem[],
  orderedItemIds: string[],
) {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const orderedItems = orderedItemIds
    .map((id) => itemById.get(id))
    .filter((item): item is CategorizedFieldSelectorItem => Boolean(item));
  const orderedItemIdSet = new Set(orderedItems.map((item) => item.id));

  items.forEach((item) => {
    if (!orderedItemIdSet.has(item.id)) {
      orderedItems.push(item);
    }
  });

  return orderedItems;
}

export function insertCategorySelectedId(
  selectedIds: string[],
  categoryItemIds: string[],
  itemId: string,
) {
  const selectedIdsSet = new Set(selectedIds);
  if (selectedIdsSet.has(itemId)) {
    return selectedIds;
  }

  const itemIndex = categoryItemIds.indexOf(itemId);

  if (itemIndex === -1) {
    return [...selectedIds, itemId];
  }

  const previousSelectedId = categoryItemIds
    .slice(0, itemIndex)
    .reverse()
    .find((id) => selectedIdsSet.has(id));

  if (previousSelectedId) {
    const insertIndex = selectedIds.indexOf(previousSelectedId) + 1;

    return [
      ...selectedIds.slice(0, insertIndex),
      itemId,
      ...selectedIds.slice(insertIndex),
    ];
  }

  const nextSelectedId = categoryItemIds
    .slice(itemIndex + 1)
    .find((id) => selectedIdsSet.has(id));

  if (nextSelectedId) {
    const insertIndex = selectedIds.indexOf(nextSelectedId);

    return [
      ...selectedIds.slice(0, insertIndex),
      itemId,
      ...selectedIds.slice(insertIndex),
    ];
  }

  return [...selectedIds, itemId];
}

export function mergeCategorySelectedIds(
  selectedIds: string[],
  categoryItemIds: string[],
  nextCategorySelectedIds: string[],
) {
  const nextCategorySelectedIdSet = new Set(nextCategorySelectedIds);
  const categoryItemIdSet = new Set(categoryItemIds);
  let nextSelectedIds = selectedIds.filter(
    (id) =>
      !categoryItemIdSet.has(id) || nextCategorySelectedIdSet.has(id),
  );

  nextCategorySelectedIds.forEach((id) => {
    nextSelectedIds = insertCategorySelectedId(
      nextSelectedIds,
      categoryItemIds,
      id,
    );
  });

  return nextSelectedIds;
}

export function replaceCategorySelectedIds(
  selectedIds: string[],
  categoryItemIds: string[],
  nextCategorySelectedIds: string[],
) {
  const categoryItemIdSet = new Set(categoryItemIds);
  let categoryIndex = 0;
  const nextSelectedIds: string[] = [];

  selectedIds.forEach((id) => {
    if (!categoryItemIdSet.has(id)) {
      nextSelectedIds.push(id);
      return;
    }

    const nextId = nextCategorySelectedIds[categoryIndex];
    categoryIndex += 1;

    if (nextId !== undefined) {
      nextSelectedIds.push(nextId);
    }
  });

  return nextCategorySelectedIds
    .slice(categoryIndex)
    .reduce(
      (currentSelectedIds, id) =>
        insertCategorySelectedId(currentSelectedIds, categoryItemIds, id),
      nextSelectedIds,
    );
}

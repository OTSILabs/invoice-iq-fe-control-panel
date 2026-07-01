

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { useCategorySectionState } from "./useCategorySectionState";

import { type CategorySectionProps } from "./categorized-field-selector";
import {
  FieldRow,
  CategoryFieldsList,
} from "./CategorySectionParts";
import { CategorySectionHeader } from "./CategorySectionHeader";

// type DragHandleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>;

export function CategorySection({
  category,
  selectedIds,
  selectedSet,
  search,
  knownItems,
  disabled,
  readonly,
  loadCategoryItems,
  getCategoryItemsQueryKey,
  onSelectedChange,
  stickyTop,
}: CategorySectionProps) {
  const {
    open,
    setOpen,
    categoryBulkAction,
    isCategoryLoading,
    isCategoryError,
    refetchCategory,
    visibleItems,
    sortableItemIds,
    fieldTotal,
    selectedCount,
    categoryCheckboxChecked,
    isLocked,
    isCategorySelectionDisabled,
    categorySelectionLabel,
    sensors,
    toggleItem,
    toggleCategorySelection,
    handleDragEnd,
  } = useCategorySectionState({
    category,
    selectedIds,
    knownItems,
    search,
    loadCategoryItems,
    getCategoryItemsQueryKey,
    disabled,
    readonly,
    onSelectedChange,
  });

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/section overflow-visible border-b border-border bg-background first:rounded-t-[inherit] last:rounded-b-[inherit] last:border-b-0"
    >
      <CategorySectionHeader
        category={category}
        open={open}
        setOpen={setOpen}
        selectedCount={selectedCount}
        fieldTotal={fieldTotal}
        isCategoryLoading={isCategoryLoading}
        categoryBulkAction={categoryBulkAction}
        categoryCheckboxChecked={categoryCheckboxChecked}
        isCategorySelectionDisabled={isCategorySelectionDisabled}
        categorySelectionLabel={categorySelectionLabel}
        toggleCategorySelection={toggleCategorySelection}
        stickyTop={stickyTop}
        readonly={readonly}
      />

      <CollapsibleContent className="overflow-visible bg-background/50 group-last/section:rounded-b-[inherit]">
        {isCategoryError ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <span className="text-xs text-destructive">
              Failed to load category fields.
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="h-7 px-2.5"
              onClick={() => void refetchCategory()}
            >
              Retry load
            </Button>
          </div>
        ) : !open || isCategoryLoading ? (
          <div className="grid gap-1.5 p-3">
            <div className="h-10 animate-pulse rounded-md bg-muted/40" />
            <div className="h-10 animate-pulse rounded-md bg-muted/40" />
          </div>
        ) : !visibleItems.length ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            {search ? "No matching fields in category." : "No fields in category."}
          </div>
        ) : (
          <CategoryFieldsList
            visibleItems={visibleItems}
            sortableItemIds={sortableItemIds}
            category={category}
            selectedSet={selectedSet}
            isLocked={isLocked}
            readonly={readonly}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            toggleItem={toggleItem}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export { FieldRow };

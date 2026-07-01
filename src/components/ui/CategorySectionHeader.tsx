
import { ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import type { CategorizedFieldSelectorCategory } from "./categorized-field-selector.utils";

export function CategorySectionHeader({
  category,
  open,
  setOpen,
  selectedCount,
  fieldTotal,
  isCategoryLoading,
  categoryBulkAction,
  categoryCheckboxChecked,
  isCategorySelectionDisabled,
  categorySelectionLabel,
  toggleCategorySelection,
  stickyTop,
  readonly,
}: {
  category: CategorizedFieldSelectorCategory;
  open: boolean;
  setOpen: (v: boolean) => void;
  selectedCount: number;
  fieldTotal: number | null | undefined;
  isCategoryLoading: boolean;
  categoryBulkAction: string | null;
  categoryCheckboxChecked: boolean | "indeterminate";
  isCategorySelectionDisabled: boolean;
  categorySelectionLabel: string;
  toggleCategorySelection: () => void;
  stickyTop?: string;
  readonly?: boolean;
}) {
  return (
    <div
      className={cn(
        "sticky z-10 border-b border-transparent bg-background px-4 py-2.5 transition-all group-first/section:rounded-t-[inherit] group-data-[state=open]/section:border-border group-data-[state=open]/section:bg-muted/30 group-data-[state=open]/section:shadow-[0_1px_2px_rgba(15,23,42,0.02)]",
        stickyTop,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {!readonly ? (
            <Checkbox
              id={`category-select-${category.id}`}
              checked={categoryCheckboxChecked}
              disabled={isCategorySelectionDisabled}
              aria-label={categorySelectionLabel}
              onCheckedChange={toggleCategorySelection}
              onClick={(event) => event.stopPropagation()}
            />
          ) : null}
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 cursor-pointer items-start gap-2 text-left focus-visible:outline-none"
              onClick={() => setOpen(!open)}
            >
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/section:rotate-90" />
              <span className="grid min-w-0 gap-0.5">
                <span className="truncate text-xs font-semibold leading-5 text-foreground">
                  {category.label}
                </span>
                {category.description ? (
                  <span className="line-clamp-1 text-[10px] leading-4 text-muted-foreground group-data-[state=open]/section:line-clamp-none">
                    {category.description}
                  </span>
                ) : null}
              </span>
            </button>
          </CollapsibleTrigger>
        </div>

        <div className="flex shrink-0 items-center gap-3 pl-4">
          <div className="flex items-center gap-1.5">
            {!readonly ? (
              <>
                <span className="text-[10px] font-bold text-primary">
                  {selectedCount}
                </span>
                {typeof fieldTotal === "number" ? (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    / {fieldTotal}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-[10px] font-medium text-muted-foreground">
                {selectedCount || fieldTotal || 0} { (selectedCount || fieldTotal || 0) === 1 ? "field" : "fields" }
              </span>
            )}
          </div>
          {isCategoryLoading || categoryBulkAction ? (
            <output
              className="size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
              aria-label="Loading fields"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

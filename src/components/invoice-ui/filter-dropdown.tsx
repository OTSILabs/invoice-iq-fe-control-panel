import { useMemo, useState, type ReactNode } from "react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  FilterDropdownContext,
  normalizeFilterValue,
  getFilterChips,
  type FilterGroup,
  type FilterValue,
} from "./filter-dropdown-context";

export function FilterDropdown({
  groups,
  value,
  onValueChange,
  children,
}: {
  groups: FilterGroup[];
  value: FilterValue;
  onValueChange: (value: FilterValue) => void;
  children: ReactNode;
}) {
  const normalizedValue = useMemo(
    () => normalizeFilterValue(value, groups),
    [groups, value],
  );
  const [pendingValue, setPendingValue] = useState<FilterValue>(normalizedValue);
  const [open, setOpen] = useState(false);
  const chips = useMemo(
    () => getFilterChips(groups, normalizedValue),
    [groups, normalizedValue],
  );
  const selectedCount = chips.length;

  const contextValue = useMemo(
    () => ({
      groups,
      value: normalizedValue,
      pendingValue,
      chips,
      selectedCount,
      setPendingValue,
      commitValue: onValueChange,
      setOpen,
    }),
    [groups, normalizedValue, pendingValue, chips, selectedCount, onValueChange],
  );

  return (
    <FilterDropdownContext.Provider value={contextValue}>
      <DropdownMenu
        open={open}
        onOpenChange={(open) => {
          setOpen(open);

          if (open) {
            setPendingValue(normalizedValue);
          }
        }}
      >
        {children}
      </DropdownMenu>
    </FilterDropdownContext.Provider>
  );
}

export { FilterDropdownTrigger } from "./filter-dropdown-trigger";
export { FilterDropdownContent } from "./filter-dropdown-content";

import {
  createContext,
  use,
  type ReactNode,
} from "react";

export type FilterSelectionMode = "multiple" | "single";

export type FilterOption = {
  value: string;
  label: ReactNode;
  chipLabel?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type FilterGroup = {
  id: string;
  label: ReactNode;
  selectionMode?: FilterSelectionMode;
  options: FilterOption[];
};

export type FilterValue = Record<string, string[]>;

export type FilterChip = {
  id: string;
  groupId: string;
  value: string;
  groupLabel: ReactNode;
  optionLabel: ReactNode;
};

export type FilterDropdownContextValue = {
  groups: FilterGroup[];
  value: FilterValue;
  pendingValue: FilterValue;
  chips: FilterChip[];
  selectedCount: number;
  setPendingValue: (value: FilterValue) => void;
  commitValue: (value: FilterValue) => void;
  setOpen: (open: boolean) => void;
};

// Internal context, not exported to satisfy unused-export rule
const FilterDropdownContext = createContext<FilterDropdownContextValue | null>(
  null,
);

export { FilterDropdownContext };

export function useFilterDropdownContext() {
  const context = use(FilterDropdownContext);

  if (!context) {
    throw new Error(
      "Filter dropdown components must be used within FilterDropdown.",
    );
  }

  return context;
}

export function normalizeFilterValue(value: FilterValue, groups: FilterGroup[]) {
  const normalized: FilterValue = {};

  groups.forEach((group) => {
    const allowedValues = new Set(group.options.map((option) => option.value));
    const selectedValues = (value[group.id] ?? []).filter((item) =>
      allowedValues.has(item),
    );

    if (selectedValues.length) {
      normalized[group.id] = Array.from(new Set(selectedValues));
    }
  });

  return normalized;
}

export function getFilterChips(groups: FilterGroup[], value: FilterValue) {
  const chips: FilterChip[] = [];

  groups.forEach((group) => {
    const optionByValue = new Map(
      group.options.map((option) => [option.value, option]),
    );

    (value[group.id] ?? []).forEach((selectedValue) => {
      const option = optionByValue.get(selectedValue);

      if (!option) {
        return;
      }

      chips.push({
        id: `${group.id}:${selectedValue}`,
        groupId: group.id,
        value: selectedValue,
        groupLabel: group.label,
        optionLabel: option.chipLabel ?? option.label,
      });
    });
  });

  return chips;
}

export function updateGroupSelection({
  currentValue,
  group,
  optionValue,
  checked,
}: {
  currentValue: FilterValue;
  group: FilterGroup;
  optionValue: string;
  checked: boolean;
}) {
  const nextValue: FilterValue = { ...currentValue };
  const currentSelection = currentValue[group.id] ?? [];

  if (group.selectionMode === "single") {
    nextValue[group.id] = checked ? [optionValue] : [];
  } else {
    nextValue[group.id] = checked
      ? [
          ...currentSelection.filter((value) => value !== optionValue),
          optionValue,
        ]
      : currentSelection.filter((value) => value !== optionValue);
  }

  if (!nextValue[group.id]?.length) {
    delete nextValue[group.id];
  }

  return nextValue;
}

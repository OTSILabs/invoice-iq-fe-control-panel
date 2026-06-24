import {
  createContext,
  use,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Filter, X } from "lucide-react";

import { SemanticBadge } from "@/components/invoice-ui/design-system";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

type FilterChip = {
  id: string;
  groupId: string;
  value: string;
  groupLabel: ReactNode;
  optionLabel: ReactNode;
};

type FilterDropdownContextValue = {
  groups: FilterGroup[];
  value: FilterValue;
  pendingValue: FilterValue;
  chips: FilterChip[];
  selectedCount: number;
  setPendingValue: (value: FilterValue) => void;
  commitValue: (value: FilterValue) => void;
  setOpen: (open: boolean) => void;
};

const FilterDropdownContext = createContext<FilterDropdownContextValue | null>(
  null,
);

function useFilterDropdownContext() {
  const context = use(FilterDropdownContext);

  if (!context) {
    throw new Error(
      "Filter dropdown components must be used within FilterDropdown.",
    );
  }

  return context;
}

function normalizeFilterValue(value: FilterValue, groups: FilterGroup[]) {
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

function getFilterChips(groups: FilterGroup[], value: FilterValue) {
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

function updateGroupSelection({
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
    [
      groups,
      normalizedValue,
      pendingValue,
      chips,
      selectedCount,
      setPendingValue,
      onValueChange,
      setOpen,
    ],
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

export function FilterDropdownTrigger({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { selectedCount } = useFilterDropdownContext();

  return (
    <DropdownMenuTrigger asChild>
      {children ?? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-8 gap-1.5", className)}
        >
          <Filter className="size-3.5" data-icon="inline-start" />
          Filters
          {selectedCount ? (
            <span className="ml-0.5 rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {selectedCount}
            </span>
          ) : null}
        </Button>
      )}
    </DropdownMenuTrigger>
  );
}

export function FilterDropdownContent({
  className,
  align = "end",
}: {
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const { groups, pendingValue, setPendingValue, commitValue, setOpen } =
    useFilterDropdownContext();

  return (
    <DropdownMenuContent
      align={align}
      className={cn(
        "grid h-[min(28rem,var(--radix-dropdown-menu-content-available-height))] !max-h-none w-80 max-w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] !overflow-hidden p-0",
        className,
      )}
    >
      <div className="shrink-0 border-b px-3 py-2.5">
        <p className="text-sm font-medium text-popover-foreground">Filters</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Select filters, then apply to update the list.
        </p>
      </div>

      <ScrollArea className="min-h-0">
        <div className="px-2 py-1">
          {groups.map((group, groupIndex) => (
            <DropdownMenuGroup
              key={`${group.id || "group"}-${groupIndex}`}
              className={cn(
                "py-1",
                groupIndex && "mt-1 border-t border-border/70 pt-2",
              )}
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-foreground">
                {group.label}
              </DropdownMenuLabel>
              <div className="space-y-0.5">
                {group.options.map((option, optionIndex) => {
                  const checked = Boolean(
                    pendingValue[group.id]?.includes(option.value),
                  );

                  return (
                    <DropdownMenuItem
                      key={`${group.id}-${option.value || "blank"}-${optionIndex}`}
                      disabled={option.disabled}
                      className="items-start gap-2 rounded-md px-2 py-2"
                      onSelect={(event) => {
                        event.preventDefault();
                        setPendingValue(
                          updateGroupSelection({
                            currentValue: pendingValue,
                            group,
                            optionValue: option.value,
                            checked: !checked,
                          }),
                        );
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={option.disabled}
                        className="mt-0.5"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm leading-5">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span className="block truncate text-xs leading-4 text-muted-foreground">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuGroup>
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between gap-2 border-t bg-popover p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => {
            setPendingValue({});
            commitValue({});
            setOpen(false);
          }}
        >
          Reset
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8"
          onClick={() => {
            commitValue(normalizeFilterValue(pendingValue, groups));
            setOpen(false);
          }}
        >
          Apply
        </Button>
      </div>
    </DropdownMenuContent>
  );
}

export function FilterDropdownChips({
  className,
}: {
  className?: string;
}) {
  const { value, chips, commitValue } = useFilterDropdownContext();

  if (!chips.length) {
    return null;
  }

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-1.5", className)}>
      {chips.map((chip) => (
        <SemanticBadge
          key={chip.id}
          tone="neutral"
          className="h-6 rounded-md font-normal"
        >
          <span className="max-w-48 truncate">
            {chip.groupLabel}: {chip.optionLabel}
          </span>
          <button
            type="button"
            className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Remove ${chip.value} filter`}
            onClick={() => {
              const nextGroupValue = (value[chip.groupId] ?? []).filter(
                (selectedValue) => selectedValue !== chip.value,
              );
              const nextValue = { ...value, [chip.groupId]: nextGroupValue };

              if (!nextGroupValue.length) {
                delete nextValue[chip.groupId];
              }

              commitValue(nextValue);
            }}
          >
            <X className="size-3" />
          </button>
        </SemanticBadge>
      ))}
    </div>
  );
}

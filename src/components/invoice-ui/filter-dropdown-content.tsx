import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useFilterDropdownContext,
  normalizeFilterValue,
  updateGroupSelection,
} from "./filter-dropdown-context";

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

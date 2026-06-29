import { type ReactNode } from "react";
import { Filter } from "lucide-react";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFilterDropdownContext } from "./filter-dropdown-context";

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

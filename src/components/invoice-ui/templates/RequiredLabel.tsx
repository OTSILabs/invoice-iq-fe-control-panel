import type { ReactNode } from "react";
import { CircleHelpIcon } from "lucide-react";
import { FieldLabel } from "@/components/ui/field";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function RequiredLabel({
  children,
  required = true,
  hint,
}: {
  children: ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <FieldLabel className="flex min-w-0 items-center gap-1 text-xs font-semibold leading-5 text-foreground">
      <span className="min-w-0 truncate">
        {children}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </span>
      {hint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              tabIndex={0}
              aria-label={hint}
            >
              <CircleHelpIcon className="size-3.5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-72 text-left leading-5">
            {hint}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </FieldLabel>
  );
}

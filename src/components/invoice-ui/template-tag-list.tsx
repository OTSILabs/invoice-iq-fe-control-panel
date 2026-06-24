import type { ReactNode } from "react";

import { SemanticBadge } from "@/components/invoice-ui/design-system";
import { cn } from "@/lib/utils";

function normalizeTags(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.flatMap((value) => {
    const trimmed = String(value).trim();
    return trimmed ? [trimmed] : [];
  });
}

export function TemplateTagList({
  label,
  values,
  maxVisible = 2,
  icon,
  className,
}: {
  label: string;
  values?: unknown;
  maxVisible?: number;
  icon?: ReactNode;
  className?: string;
}) {
  const tags = normalizeTags(values);

  if (!tags.length) {
    return null;
  }

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = Math.max(tags.length - visibleTags.length, 0);

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 items-center gap-1.5 sm:grid-cols-[minmax(5.75rem,6.5rem)_minmax(0,1fr)] sm:gap-2",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon ? (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground ring-1 ring-border/70">
            {icon}
          </span>
        ) : null}
        <span className="truncate text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {visibleTags.map((tag) => (
          <SemanticBadge
            key={tag}
            tone="neutral"
            className="max-w-36 rounded-md font-medium"
            title={tag}
          >
            <span className="truncate">{tag}</span>
          </SemanticBadge>
        ))}
        {hiddenCount > 0 ? (
          <SemanticBadge tone="neutral" className="rounded-md font-medium">
            +{hiddenCount} more
          </SemanticBadge>
        ) : null}
      </div>
    </div>
  );
}

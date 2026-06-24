import { type ReactNode } from "react";
import { humanizeDateTime } from "@/lib/utils";
import { SemanticBadge } from "@/components/invoice-ui/design-system";

export type TemplateDetailRow = {
  label: string;
  value: ReactNode;
  always?: boolean;
};

export function getTrimmedValue(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

export function getOptionalDisplayValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

export function getDateDisplayValue(value: unknown) {
  return humanizeDateTime(value instanceof Date || typeof value === "string" || typeof value === "number" ? value : null, "dd MMM yy, h:mm a");
}

export function getTagBadges(values: unknown) {
  if (!Array.isArray(values)) {
    return null;
  }

  const tags = values.flatMap((value) => {
    const trimmed = String(value).trim();
    return trimmed ? [trimmed] : [];
  });

  if (!tags.length) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <SemanticBadge
          key={tag}
          tone="neutral"
          className="max-w-48 rounded-md font-medium"
          title={tag}
        >
          <span className="truncate">{tag}</span>
        </SemanticBadge>
      ))}
    </div>
  );
}

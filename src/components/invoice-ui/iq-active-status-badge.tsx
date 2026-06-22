import type { ApiRecord } from "@/api/api.helpers";
import { getTemplateIsActive } from "@/components/invoice-ui/templates/template-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function IqActiveStatusBadge({
  template,
  isActive: explicitIsActive,
  className,
  showDot = true,
}: {
  template?: ApiRecord;
  isActive?: boolean;
  className?: string;
  showDot?: boolean;
}) {
  const isActive =
    explicitIsActive ?? (template ? getTemplateIsActive(template) : false);

  return (
    <Badge
      variant={isActive ? "secondary" : "outline"}
      className={cn(
        "h-6 gap-1.5 rounded-full px-2 text-xs font-semibold shadow-none",
        !isActive && "text-muted-foreground",
        className,
      )}
    >
      {showDot ? (
        <span
          className={cn(
            "size-2 rounded-full",
            isActive ? "bg-emerald-600" : "bg-muted-foreground/70",
          )}
        />
      ) : null}
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

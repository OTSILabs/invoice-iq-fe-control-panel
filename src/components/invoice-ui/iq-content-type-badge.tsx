import type { ApiRecord } from "@/api/api.helpers";
import {
  getTemplateContentType,
  getTemplateIsStandard,
} from "@/components/invoice-ui/templates/template-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function IqContentTypeBadge({
  template,
  contentType: explicitContentType,
  isStandard: explicitIsStandard,
  className,
}: {
  template?: ApiRecord;
  contentType?: string;
  isStandard?: boolean;
  className?: string;
}) {
  const contentType =
    explicitContentType ?? (template ? getTemplateContentType(template) : "");
  const isStandard =
    explicitIsStandard ?? (template ? getTemplateIsStandard(template) : false);

  if (!contentType) {
    return null;
  }

  return (
    <Badge
      variant={isStandard ? "default" : "secondary"}
      className={cn(
        "h-6 rounded-sm px-2 text-[10px] font-semibold uppercase leading-none shadow-none",
        isStandard
          ? "bg-primary !text-primary-foreground"
          : "border border-border bg-secondary !text-secondary-foreground",
        className,
      )}
    >
      {contentType}
    </Badge>
  );
}

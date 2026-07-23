import type { ApiRecord } from "@/api/templates/api.helpers";
import {
  getTemplateContentType,
  getTemplateIsStandard,
} from "@/components/invoice-ui/templates/template-data";
import { SemanticBadge } from "@/components/invoice-ui/design-system";
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
    <SemanticBadge
      tone={isStandard ? "info" : "accent"}
      className={cn(
        "h-6 rounded-sm  leading-none",
        className,
      )}
    >
      {contentType}
    </SemanticBadge>
  );
}

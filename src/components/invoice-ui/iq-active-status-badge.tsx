import type { ApiRecord } from "@/api/api.helpers";
import { getTemplateIsActive } from "@/components/invoice-ui/templates/template-data";
import { StatusBadge } from "@/components/invoice-ui/design-system";

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

  return <StatusBadge active={isActive} className={className} showDot={showDot} />;
}

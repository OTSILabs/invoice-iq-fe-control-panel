import type { ApiRecord } from "@/api/api.helpers";
import { cn } from "@/lib/utils";
import { IqContentTypeBadge } from "./iq-content-type-badge";
import { IqActiveStatusBadge } from "./iq-active-status-badge";

export function IqStatusBadges({
  template,
  className,
  showStatusDot = true,
}: {
  template: ApiRecord;
  className?: string;
  showStatusDot?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <IqContentTypeBadge template={template} />
      <IqActiveStatusBadge template={template} showDot={showStatusDot} />
    </div>
  );
}

export { IqContentTypeBadge, IqActiveStatusBadge };


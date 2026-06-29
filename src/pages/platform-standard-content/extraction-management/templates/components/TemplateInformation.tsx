import type { ApiRecord } from "@/api/api.helpers";
import { Switch } from "@/components/ui/switch";
import { IqActiveStatusBadge, IqContentTypeBadge } from "@/components/invoice-ui/iq-status-badges";
import { DetailGrid } from "@/components/ui/detail-grid";

import {
  getTrimmedValue,
  getOptionalDisplayValue,
  getDateDisplayValue,
  getTagBadges,
} from "../template-details.helpers";
import { getTemplateCode, getTemplateContentType, getTemplateIsActive } from "@/components/invoice-ui/templates/template-data";

export function TemplateInformation({
  template,
  canManageTemplate,
  isActiveStatePending,
  onActiveStateChange,
}: {
  template: ApiRecord;
  canManageTemplate: boolean;
  isActiveStatePending: boolean;
  onActiveStateChange: () => void;
}) {
  const description = getTrimmedValue(template.description);
  const isActive = getTemplateIsActive(template);
  const activeSince = getDateDisplayValue(template.activated_at);
  const contentType = getTemplateContentType(template);

  const gridItems = [
    {
      label: "Status",
      content: (
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <IqActiveStatusBadge template={template} />
          {canManageTemplate ? (
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
              <Switch
                checked={isActive}
                disabled={isActiveStatePending}
                aria-label={
                  isActive ? "Disable template" : "Activate template"
                }
                onCheckedChange={onActiveStateChange}
              />
              {isActive ? "Disable template" : "Activate template"}
            </label>
          ) : null}
          {isActive && activeSince ? (
            <span className="text-xs text-muted-foreground">
              Active since {activeSince}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      label: "Template type",
      content: contentType ? (
        <IqContentTypeBadge template={template} />
      ) : (
        <p className="text-xs font-semibold text-foreground">—</p>
      ),
    },
    {
      label: "Template ID",
      content: (
        <p className="font-mono text-xs font-semibold text-foreground truncate" title={getTemplateCode(template)}>
          {getTemplateCode(template)}
        </p>
      ),
    },
    {
      label: "Process tags",
      content: getTagBadges(template.business_process_tags) || (
        <p className="text-xs font-semibold text-foreground">—</p>
      ),
    },
    {
      label: "Document tags",
      content: getTagBadges(template.document_type_tags) || (
        <p className="text-xs font-semibold text-foreground">—</p>
      ),
    },
    {
      label: "Tax tags",
      content: getTagBadges(template.taxation_tags) || (
        <p className="text-xs font-semibold text-foreground">—</p>
      ),
    },
    {
      label: "Platform ID",
      content: (
        <p className="text-xs font-semibold text-foreground">
          {getOptionalDisplayValue(template.source_platform_template_id)}
        </p>
      ),
    },
    {
      label: "Version",
      content: (
        <p className="text-xs font-semibold text-foreground">
          {getOptionalDisplayValue(template.source_platform_version_no)}
        </p>
      ),
    },
    {
      label: "Last synced",
      content: (
        <p className="text-xs font-semibold text-foreground">
          {getDateDisplayValue(template.last_synced_at)}
        </p>
      ),
    },
    {
      label: "Created by",
      content: (
        <p className="text-xs font-semibold text-foreground">
          {getOptionalDisplayValue(template.created_by)}
        </p>
      ),
    },
    {
      label: "Created",
      content: (
        <p className="text-xs font-semibold text-foreground">
          {getDateDisplayValue(template.created_at)}
        </p>
      ),
    },
    {
      label: "Updated",
      content: (
        <p className="text-xs font-semibold text-foreground">
          {getDateDisplayValue(template.updated_at)}
        </p>
      ),
    },
  ];

  return (
    <div className="w-full overflow-hidden rounded-md border border-border bg-card">
      <DetailGrid cols={3}>
        {gridItems.map((item) => (
          <DetailGrid.Item key={item.label} label={item.label}>
            {item.content}
          </DetailGrid.Item>
        ))}
      </DetailGrid>

      <div className="flex flex-col gap-1.5 border-t border-border/40 bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground">Description</p>
        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
          {description || "No description provided."}
        </p>
      </div>
    </div>
  );
}


import type { ApiRecord } from "@/api/api.helpers";
import { Switch } from "@/components/ui/switch";
import { IqActiveStatusBadge, IqContentTypeBadge } from "@/components/invoice-ui/iq-status-badges";
import {
  TemplateDetailGrid,
} from "../template-details.parts";
import {
  getTrimmedValue,
  getOptionalDisplayValue,
  getDateDisplayValue,
  getTagBadges,
  type TemplateDetailRow,
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
  const detailRows: TemplateDetailRow[] = [
    {
      label: "Status",
      value: (
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <IqActiveStatusBadge template={template} />
          {canManageTemplate ? (
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
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
      always: true,
    },
    {
      label: "Template type",
      value: contentType ? (
        <IqContentTypeBadge template={template} />
      ) : null,
    },
    { label: "Template ID", value: getTemplateCode(template), always: true },
    {
      label: "Description",
      value: description || null,
    },
    {
      label: "Process tags",
      value: getTagBadges(template.business_process_tags),
    },
    {
      label: "Document tags",
      value: getTagBadges(template.document_type_tags),
    },
    {
      label: "Tax tags",
      value: getTagBadges(template.taxation_tags),
    },
    {
      label: "Platform ID",
      value: getOptionalDisplayValue(template.source_platform_template_id),
    },
    {
      label: "Version",
      value: getOptionalDisplayValue(template.source_platform_version_no),
    },
    { label: "Last synced", value: getDateDisplayValue(template.last_synced_at) },
    { label: "Created by", value: getOptionalDisplayValue(template.created_by) },
    { label: "Created", value: getDateDisplayValue(template.created_at) },
    { label: "Updated", value: getDateDisplayValue(template.updated_at) },
  ];

  return <TemplateDetailGrid rows={detailRows} />;
}

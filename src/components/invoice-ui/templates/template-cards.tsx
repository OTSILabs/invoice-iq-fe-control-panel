import { Link } from "react-router";
import {
  CalendarDays,
  ChevronRight,
  Copy,
  Edit2,
  FileText,
  ListChecks,
  LockKeyhole,
  MoreVertical,
  Network,
  Percent,
  Trash2,
} from "lucide-react";

import type { ApiRecord } from "@/api/api.helpers";

const EMPTY_TEMPLATES: ApiRecord[] = [];
import { IqStatusBadges } from "@/components/invoice-ui/iq-status-badges";
import { TemplateTagList } from "@/components/invoice-ui/template-tag-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, humanizeDateTime } from "@/lib/utils";

import {
  getTemplateCode,
  getTemplateFieldCount,
  getTemplateIsActive,
  getTemplateIsDefault,
  getTemplateIsEditable,
  getTemplateName,
} from "./template-data";

function getDateValue(value: unknown) {
  return value instanceof Date ||
    typeof value === "string" ||
    typeof value === "number"
    ? value
    : null;
}

function TemplateStatusBadges({ template }: { template: ApiRecord }) {
  const isEditable = getTemplateIsEditable(template);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <IqStatusBadges template={template} />

      {!isEditable ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex h-6 shrink-0 cursor-help items-center gap-2 rounded-full border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600">
              <LockKeyhole className="size-3.5" />
              Read-only
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            This template is not editable.
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

export function TemplateCards({
  templates = EMPTY_TEMPLATES,
  onCloneTemplate,
  onDeleteTemplate,
  onToggleActive,
  togglingTemplateCode,
}: {
  templates?: ApiRecord[];
  onCloneTemplate?: (template: ApiRecord) => void;
  onDeleteTemplate?: (template: ApiRecord) => void;
  onToggleActive?: (template: ApiRecord, nextIsActive: boolean) => void;
  togglingTemplateCode?: string | null;
}) {
  if (!templates.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No templates found</EmptyTitle>
          <EmptyDescription>
            Create a template to start managing invoice extraction fields.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => {
        const templateCode = getTemplateCode(template);
        const templateName = getTemplateName(template);
        const fieldCount = getTemplateFieldCount(template);
        const isDefault = getTemplateIsDefault(template);
        const isActive = getTemplateIsActive(template);
        const isEditable = getTemplateIsEditable(template);
        const canManageTemplate = Boolean(
          templateCode && isEditable && !isDefault,
        );
        const hasTags = [
          template.business_process_tags,
          template.document_type_tags,
          template.taxation_tags,
        ].some((tags) => Array.isArray(tags) && tags.length > 0);
        const href = `/platform-standard-content/extraction-management/templates/${templateCode}`;
        const editHref = `/platform-standard-content/extraction-management/templates/${templateCode}/edit`;
        const updatedAt =
          humanizeDateTime(getDateValue(template.updated_at), "dd MMM yy") ||
          "N/A";

        return (
          <Card
            key={templateCode || templateName}
            className={cn(
              "group h-full gap-0 overflow-hidden rounded-lg bg-card py-0",
            )}
          >
            <CardHeader className="gap-0 border-b border-border/40 bg-card p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-3">
                  <TemplateCardTitle
                    template={template}
                    templateName={templateName}
                  />

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <ListChecks className="size-3.5 text-slate-500" />
                      <span>
                        <span className="font-semibold text-slate-950">
                          {fieldCount}
                        </span>{" "}
                        Fields
                      </span>
                    </div>
                    <span className="hidden h-5 w-px bg-slate-200 sm:block" />
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-3.5 text-slate-500" />
                      <span>Updated {updatedAt}</span>
                    </div>
                  </div>
                </div>

                {templateCode ? (
                  <div className="flex shrink-0 items-center gap-2">
                    {canManageTemplate ? (
                      <Switch
                        checked={isActive}
                        disabled={togglingTemplateCode === templateCode}
                        aria-label={`${isActive ? "Disable" : "Activate"} ${templateName}`}
                        onCheckedChange={(checked) =>
                          onToggleActive?.(template, checked)
                        }
                      />
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-md bg-transparent p-0 text-slate-500 shadow-none hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Template actions"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManageTemplate ? (
                          <DropdownMenuItem asChild>
                            <Link to={editHref}>
                              <Edit2
                                className="size-4"
                                data-icon="inline-start"
                              />
                              Edit Template
                            </Link>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onSelect={() => onCloneTemplate?.(template)}
                        >
                          <Copy className="size-4" data-icon="inline-start" />
                          Clone Template
                        </DropdownMenuItem>
                        {canManageTemplate ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => onDeleteTemplate?.(template)}
                          >
                            <Trash2
                              className="size-4"
                              data-icon="inline-start"
                            />
                            Delete Template
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : null}
              </div>
            </CardHeader>

            {hasTags ? (
              <CardContent className="space-y-2.5 border-b border-border/40 px-4 py-3 flex-1">
                <TemplateTagList
                  label="Process"
                  values={template.business_process_tags}
                  icon={<Network className="size-3.5" />}
                />
                <TemplateTagList
                  label="Document"
                  values={template.document_type_tags}
                  icon={<FileText className="size-3.5" />}
                />
                <TemplateTagList
                  label="Tax"
                  values={template.taxation_tags}
                  icon={<Percent className="size-3.5" />}
                />
              </CardContent>
            ) : null}

            <CardFooter className="border-t border-border/30 bg-muted/25 p-0!">
              {templateCode ? (
                <Link
                  to={href}
                  className="flex min-h-12 w-full items-center justify-between px-4 text-xs font-semibold text-blue-700 outline-none transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>View Details</span>
                  <ChevronRight className="size-4" />
                </Link>
              ) : (
                <div className="flex min-h-12 w-full items-center justify-between px-4 text-xs font-semibold text-muted-foreground">
                  <span>View Details</span>
                  <ChevronRight className="size-4" />
                </div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function TemplateCardTitle({
  template,
  templateName,
}: {
  template: ApiRecord;
  templateName: string;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <CardTitle className="truncate text-sm font-semibold leading-5">
        {templateName}
      </CardTitle>
      <TemplateStatusBadges template={template} />
    </div>
  );
}

import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Edit2,
  FileText,
  ListChecks,
  LockKeyhole,
  MoreVertical,
  Network,
  Trash2,
} from "lucide-react";

import type { ApiRecord } from "@/api/api.helpers";
import { IqStatusBadges } from "@/components/invoice-ui/iq-status-badges";
import { EmptyState } from "@/components/invoice-ui/design-system";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, humanizeDateTime } from "@/lib/utils";

import {
  getTemplateCode,
  getTemplateFieldCount,
  getTemplateName,
} from "./template-data";

const EMPTY_TEMPLATES: ApiRecord[] = [];

function getDateValue(value: unknown) {
  return value instanceof Date ||
    typeof value === "string" ||
    typeof value === "number"
    ? value
    : null;
}

function TemplateStatusBadges({ template }: { template: ApiRecord }) {
  // Derived templates might not be purely "Standard" or "Custom" in the same way, but they do have `content_type: "Standard"`
  const isEditable = true; // For now derived templates are editable via their edit form

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <IqStatusBadges template={template} />
      
      {!isEditable ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex h-6 shrink-0 cursor-help items-center gap-2 rounded-full border border-border/70 bg-background px-2 text-xs font-semibold text-muted-foreground">
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

export function DerivedTemplateCards({
  templates = EMPTY_TEMPLATES,
  onDeleteTemplate,
  isLoading = false,
}: {
  templates?: ApiRecord[];
  onDeleteTemplate?: (template: ApiRecord) => void;
   isLoading?: boolean;
}) {
   if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="h-[200px] w-full bg-card border border-border/50 rounded-xl overflow-hidden flex flex-col animate-pulse">
            <CardHeader className="gap-3 border-b border-border/60 bg-muted/15 p-4 flex-1">
              <div className="h-5 bg-muted-foreground/15 rounded w-1/2" />
              <div className="h-3 bg-muted-foreground/10 rounded w-3/4" />
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-2.5">
              <div className="h-3 bg-muted-foreground/10 rounded w-full" />
              <div className="h-3 bg-muted-foreground/10 rounded w-5/6" />
            </CardContent>
            <CardFooter className="p-4 border-t border-border/60 flex justify-between items-center">
              <div className="h-4 bg-muted-foreground/10 rounded w-1/4" />
              <div className="h-4 bg-muted-foreground/10 rounded w-1/6" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!templates.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No derived templates found"
        description="Create a derived template to start extending extraction fields."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => {
        const templateCode = getTemplateCode(template);
        const templateName = getTemplateName(template);
        const fieldCount = getTemplateFieldCount(template);
        const canManageTemplate = Boolean(templateCode); // Derived templates are always manageable for now
        
        const href = `/platform-standard-content/extraction-management/derived/${templateCode}`;
        const editHref = `/platform-standard-content/extraction-management/derived/${templateCode}/edit`;
        const updatedAt =
          humanizeDateTime(getDateValue(template.updated_at), "dd MMM yy") ||
          "N/A";

        return (
          <Card
            key={templateCode || templateName}
            className={cn(
              "surface-card group h-full gap-0 overflow-hidden py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_color-mix(in_oklch,var(--foreground)_8%,transparent),0_20px_48px_color-mix(in_oklch,var(--foreground)_8%,transparent)]",
            )}
          >
            <CardHeader className="gap-0 border-b border-border/60 bg-muted/15 p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-3">
                  <TemplateCardTitle
                    template={template}
                    templateName={templateName}
                  />

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ListChecks className="size-3.5 text-muted-foreground" />
                      <span>
                        <span className="font-semibold text-foreground">
                          {fieldCount}
                        </span>{" "}
                        Fields
                      </span>
                    </div>
                    <span className="hidden h-5 w-px bg-border sm:block" />
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-3.5 text-muted-foreground" />
                      <span>Updated {updatedAt}</span>
                    </div>
                  </div>
                </div>

                {templateCode ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-md bg-transparent p-0 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
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
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        ) : null}
                        {canManageTemplate ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => onDeleteTemplate?.(template)}
                          >
                            <Trash2
                              className="size-4"
                              data-icon="inline-start"
                            />
                            Delete
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-2.5 border-b border-border/45 px-4 py-3">
                <TemplateTagList
                  label="ERP Type"
                  values={[template.erp_type]}
                  icon={<Network className="size-3.5" />}
                />
                <TemplateTagList
                  label="Document Code"
                  values={[template.document_type_code]}
                  icon={<FileText className="size-3.5" />}
                />
            </CardContent>

            <CardFooter className="border-t border-border/60 bg-muted/20 p-0!">
              {templateCode ? (
                <Link
                  to={href}
                  className="flex min-h-12 w-full items-center justify-between px-4 text-xs font-semibold text-primary outline-none transition-colors hover:bg-primary/8 focus-visible:ring-2 focus-visible:ring-ring"
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

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, GripVertical, ListChecks, X } from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  TEMPLATE_CONTENT_TYPES,
  type ExtractionFieldResponse,
  type FieldCategoryResponse,
  type TemplateMembershipResponse,
} from "@/api/templates/templates.types";
import {
  IqActiveStatusBadge,
  IqContentTypeBadge,
} from "@/components/invoice-ui/iq-status-badges";
import { EmptyState, SemanticBadge, type SemanticTone } from "@/components/invoice-ui/design-system";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, humanizeDateTime } from "@/lib/utils";

const EMPTY_FIELDS: any[] = [];
const EMPTY_CATEGORIES: any[] = [];
const EMPTY_OPTIONS = {};

export type FieldListTableRecord =
  | ExtractionFieldResponse
  | TemplateMembershipResponse;

export type FieldListTableActionProps<TField extends FieldListTableRecord> = {
  field: TField;
  fieldCode: string;
  isExpanded: boolean;
  isSortingDisabled: boolean;
};

type FieldListTableProps<TField extends FieldListTableRecord> = {
  fields?: TField[];
  categories?: FieldCategoryResponse[];
  title?: ReactNode;
  description?: ReactNode;
  totalFields?: number | null;
  options?: {
    isLoading?: boolean;
    sortable?: boolean;
    showOrderColumn?: boolean;
    isSortOrderSaving?: boolean;
    isSortingDisabled?: boolean;
    showSortSequenceInSubtitle?: boolean;
    scrollable?: boolean;
  };
  emptyTitle?: string;
  emptyDescription?: string;
  actionsColumnLabel?: string;
  renderActions?: (props: FieldListTableActionProps<TField>) => ReactNode;
  onSortOrderChange?: (fieldCodes: string[]) => void;
  className?: string;
};

function getFieldCode(field: FieldListTableRecord) {
  return field.field_id;
}

function getFieldCodes(fields: FieldListTableRecord[]) {
  return fields.flatMap((field) => {
    const code = getFieldCode(field);
    return code ? [code] : [];
  });
}

function getTrimmedValue(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function toDisplayValue(value: unknown, fallback = "N/A") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function toOptionalDisplayValue(value: unknown) {
  return value === null || value === undefined || value === ""
    ? null
    : toDisplayValue(value);
}

function getFieldLabel(field: FieldListTableRecord) {
  return getTrimmedValue(field.field_label) || field.field_id;
}

function getFieldShortDescription(field: FieldListTableRecord) {
  return getTrimmedValue(field.short_desc);
}

function getFieldLongDescription(field: FieldListTableRecord) {
  return getTrimmedValue(field.field_long_description);
}

function getFieldDescription(field: FieldListTableRecord) {
  return getFieldLongDescription(field) || getFieldShortDescription(field);
}

function getFieldDataTypeLabel(field: FieldListTableRecord) {
  return toDisplayValue(field.data_type_code, "string");
}

function getFieldPositionLabel(field: FieldListTableRecord) {
  const value = getTrimmedValue(field.header_item).toLowerCase();

  if (value === "header") {
    return "Header";
  }

  if (value === "item") {
    return "Line Item";
  }

  return toDisplayValue(field.header_item, "Header");
}

function getFieldContentTypeLabel(field: FieldListTableRecord) {
  return toDisplayValue(field.content_type, TEMPLATE_CONTENT_TYPES.CUSTOM);
}

function getFieldIsStandard(field: FieldListTableRecord) {
  return (
    getFieldContentTypeLabel(field).toLowerCase() ===
    TEMPLATE_CONTENT_TYPES.STANDARD.toLowerCase()
  );
}

function getFieldIsActive(field: FieldListTableRecord) {
  return field.is_active !== false;
}

function getFieldIsEditable(field: FieldListTableRecord) {
  if (getFieldIsStandard(field)) {
    return false;
  }

  return field.is_editable !== false;
}

function getFieldSourceMode(field: FieldListTableRecord) {
  return field.field_source_mode ?? field.source_mode;
}

function getDateValue(value: unknown, dateFormat = "dd MMM yy, h:mm a") {
  if (
    value instanceof Date ||
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return humanizeDateTime(value, dateFormat) ?? String(value);
  }

  return null;
}

function getDisplayItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (item === null || item === undefined || item === "") {
      return [];
    }

    let valStr = "";
    if (typeof item === "string" || typeof item === "number") {
      valStr = String(item);
    } else {
      try {
        valStr = JSON.stringify(item);
      } catch {
        valStr = String(item);
      }
    }
    return valStr ? [valStr] : [];
  });
}

function hasDisplayValue(value: ReactNode) {
  return value !== null && value !== undefined && value !== "";
}

function hasDisplayItems(value: unknown) {
  return getDisplayItems(value).length > 0;
}

function areFieldCodesEqual(firstCodes: string[], secondCodes: string[]) {
  return (
    firstCodes.length === secondCodes.length &&
    firstCodes.every((fieldCode, index) => fieldCode === secondCodes[index])
  );
}

function getCategoryByCode(categories: FieldCategoryResponse[]) {
  return new Map(
    categories.map((category) => [category.field_category_code, category]),
  );
}

function getFieldCategory(
  field: FieldListTableRecord,
  categoryByCode: Map<string, FieldCategoryResponse>,
) {
  return field.field_category_code
    ? categoryByCode.get(field.field_category_code)
    : undefined;
}

function getFieldCategoryLabel(
  field: FieldListTableRecord,
  category?: FieldCategoryResponse,
) {
  return (
    getTrimmedValue(category?.ui_label) ||
    getTrimmedValue(field.field_category_code) ||
    "Uncategorized"
  );
}

function getDesktopGridClass(showOrderColumn: boolean) {
  return showOrderColumn
    ? "md:grid-cols-[auto_2.25rem_minmax(18rem,1fr)_4.25rem_4.75rem_5.25rem_5.25rem]"
    : "md:grid-cols-[minmax(18rem,1fr)_4.25rem_4.75rem_5.25rem_5.25rem]";
}

type FieldBadgeData = {
  label: string;
  tone: SemanticTone;
};

function getFieldBadgeData(field: FieldListTableRecord): [FieldBadgeData, FieldBadgeData, FieldBadgeData] {
  const isStandard = getFieldIsStandard(field);
  return [
    {
      label: getFieldDataTypeLabel(field),
      tone: "neutral",
    },
    {
      label: getFieldPositionLabel(field),
      tone: "accent",
    },
    {
      label: getFieldContentTypeLabel(field),
      tone: isStandard ? "info" : "neutral",
    },
  ];
}

function FieldBadge({ badge }: { badge: FieldBadgeData }) {
  return (
    <SemanticBadge tone={badge.tone} className="rounded-md uppercase tracking-normal">
      {badge.label}
    </SemanticBadge>
  );
}

type DetailRowData = {
  label: string;
  value: ReactNode;
  always?: boolean;
  fallback?: ReactNode;
};

type DetailTableItem =
  | {
      type: "section";
      label: string;
    }
  | ({
      type: "row";
    } & DetailRowData);

function DetailTable({
  items,
  emptyMessage = "No metadata available.",
}: {
  items: DetailTableItem[];
  emptyMessage?: string;
}) {
  const visibleItems = items.reduce<{
    items: DetailTableItem[];
    pendingSection: DetailTableItem | null;
  }>(
    (result, item) => {
      if (item.type === "section") {
        return { ...result, pendingSection: item };
      }

      if (!item.always && !hasDisplayValue(item.value)) {
        return result;
      }

      return {
        items: result.pendingSection
          ? [...result.items, result.pendingSection, item]
          : [...result.items, item],
        pendingSection: null,
      };
    },
    { items: [], pendingSection: null },
  ).items;

  if (!visibleItems.some((item) => item.type === "row")) {
    return (
      <p className="rounded-md border border-dashed bg-background px-3 py-2.5 text-sm leading-5 text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border/70 text-sm">
      {visibleItems.map((item) =>
        item.type === "section" ? (
          <div
            key={`section-${item.label}`}
            className="border-b border-border/60 bg-muted/45 px-3 py-2.5 text-sm font-semibold leading-5 text-foreground last:border-b-0"
          >
            {item.label}
          </div>
        ) : (
          <div
            key={`row-${item.label}`}
            className="grid min-h-10 grid-cols-[9rem_minmax(0,1fr)] border-b border-border/60 last:border-b-0"
          >
            <span className="min-w-0 border-r border-border/60 bg-muted/25 px-3 py-2.5 font-medium leading-5 text-foreground/75">
              {item.label}
            </span>
            <span className="min-w-0 break-words px-3 py-2.5 leading-5 text-foreground">
              {hasDisplayValue(item.value) ? item.value : item.fallback ?? "N/A"}
            </span>
          </div>
        ),
      )}
    </div>
  );
}

function TokenValue({
  items,
}: {
  items: unknown;
}) {
  const values = getDisplayItems(items);

  if (!values.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((item, index) => (
        <SemanticBadge
          key={`${item}-${index}`}
          tone="neutral"
          className="h-auto min-h-6 rounded-sm leading-5"
        >
          {item}
        </SemanticBadge>
      ))}
    </div>
  );
}

function TextValue({
  items,
}: {
  items: unknown;
}) {
  const values = getDisplayItems(items);

  if (!values.length) {
    return null;
  }

  return (
    <ol className="space-y-1.5">
      {values.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex gap-2 text-sm leading-5 text-foreground"
        >
          <span className="text-muted-foreground">{index + 1}.</span>
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function FieldDetailsDrawer({
  open,
  field,
  category,
  onOpenChange,
}: {
  open: boolean;
  field: FieldListTableRecord | null;
  category?: FieldCategoryResponse;
  onOpenChange: (open: boolean) => void;
}) {
  if (!field) {
    return null;
  }

  const shortDescription = getFieldShortDescription(field);
  const longDescription = getFieldLongDescription(field);
  const headerDescription =
    longDescription || shortDescription || "No description available.";
  const categoryLabel = getFieldCategoryLabel(field, category);
  const categoryDescription = getTrimmedValue(category?.description);
  const hasLabels = hasDisplayItems(field.labels);
  const hasExamples = hasDisplayItems(field.examples);
  const hasInstructions = hasDisplayItems(field.extraction_instructions);
  const hasAllowedValues = hasDisplayItems(field.allowed_static_list);
  const detailItems: DetailTableItem[] = [
    { type: "section", label: "Core details" },
    { type: "row", label: "Field ID", value: field.field_id, always: true },
    {
      type: "row",
      label: "Status",
      value: <IqActiveStatusBadge isActive={getFieldIsActive(field)} />,
      always: true,
    },
    {
      type: "row",
      label: "Type",
      value: getFieldDataTypeLabel(field),
      always: true,
    },
    {
      type: "row",
      label: "Position",
      value: getFieldPositionLabel(field),
      always: true,
    },
    {
      type: "row",
      label: "Content type",
      value: (
        <IqContentTypeBadge
          contentType={getFieldContentTypeLabel(field)}
          isStandard={getFieldIsStandard(field)}
        />
      ),
      always: true,
    },
    {
      type: "row",
      label: "Editable",
      value: getFieldIsEditable(field) ? "Yes" : "No",
      always: true,
    },
    {
      type: "row",
      label: "Source mode",
      value: toOptionalDisplayValue(getFieldSourceMode(field)),
    },
    { type: "section", label: "Category" },
    { type: "row", label: "Category", value: categoryLabel, always: true },
    {
      type: "row",
      label: "Description",
      value: categoryDescription || null,
    },
    {
      type: "row",
      label: "Category ID",
      value: toOptionalDisplayValue(field.field_category_code),
    },
    {
      type: "row",
      label: "Category source",
      value: toOptionalDisplayValue(category?.content_type),
    },
    {
      type: "row",
      label: "Category active",
      value: toOptionalDisplayValue(category?.is_active),
    },
    {
      type: "row",
      label: "Active fields",
      value: toOptionalDisplayValue(category?.active_field_count),
    },
    {
      type: "row",
      label: "Inactive fields",
      value: toOptionalDisplayValue(category?.inactive_field_count),
    },
    { type: "section", label: "Template membership" },
    {
      type: "row",
      label: "Template field",
      value: toOptionalDisplayValue(field.template_field_id),
    },
    {
      type: "row",
      label: "Template ID",
      value: toOptionalDisplayValue(field.template_id),
    },
    { type: "section", label: "Extraction guidance" },
    {
      type: "row",
      label: "Labels",
      value: hasLabels ? <TokenValue items={field.labels} /> : null,
    },
    {
      type: "row",
      label: "Examples",
      value: hasExamples ? <TokenValue items={field.examples} /> : null,
    },
    {
      type: "row",
      label: "Instructions",
      value: hasInstructions ? (
        <TextValue items={field.extraction_instructions} />
      ) : null,
    },
    { type: "section", label: "Value rules" },
    {
      type: "row",
      label: "Allowed mode",
      value: toOptionalDisplayValue(field.allowed_value_mode),
    },
    {
      type: "row",
      label: "Allowed values",
      value: hasAllowedValues ? (
        <TokenValue items={field.allowed_static_list} />
      ) : null,
    },
    {
      type: "row",
      label: "Default value",
      value: toOptionalDisplayValue(field.default_value),
    },
    {
      type: "row",
      label: "Reference key",
      value: toOptionalDisplayValue(field.allowed_reference_registry_key),
    },
    { type: "section", label: "Source and sync" },
    {
      type: "row",
      label: "Platform field",
      value: toOptionalDisplayValue(field.source_platform_field_id),
    },
    {
      type: "row",
      label: "Platform version",
      value: toOptionalDisplayValue(field.source_platform_version_no),
    },
    {
      type: "row",
      label: "Parent field",
      value: toOptionalDisplayValue(field.source_parent_field_id),
    },
    {
      type: "row",
      label: "Root field",
      value: toOptionalDisplayValue(field.root_platform_field_id),
    },
    {
      type: "row",
      label: "Last synced",
      value: getDateValue(field.last_synced_at),
    },
    { type: "section", label: "Audit" },
    { type: "row", label: "Activated", value: getDateValue(field.activated_at) },
    {
      type: "row",
      label: "Created by",
      value: toOptionalDisplayValue(field.created_by),
    },
    { type: "row", label: "Created", value: getDateValue(field.created_at) },
    { type: "row", label: "Updated", value: getDateValue(field.updated_at) },
  ];

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-0 before:inset-0 before:rounded-none data-[vaul-drawer-direction=right]:w-[min(42rem,100vw)] data-[vaul-drawer-direction=right]:sm:max-w-2xl">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit]">
          <DrawerHeader className="shrink-0 border-b px-5 py-4 text-left">
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="min-w-0">
                <DrawerTitle className="break-words text-base font-semibold leading-6">
                  {getFieldLabel(field)}
                </DrawerTitle>
                <DrawerDescription className="mt-1 break-words text-sm leading-5">
                  {headerDescription}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close field details"
                  className="size-8 shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <ScrollArea className="min-h-0 flex-1 bg-muted/5">
            <div className="p-5">
              <DetailTable items={detailItems} />
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

type FieldTableRowProps<TField extends FieldListTableRecord> = {
  field: TField;
  index: number;
  options: {
    showOrderColumn: boolean;
    isExpanded: boolean;
    isSortingDisabled: boolean;
    showSortSequenceInSubtitle: boolean;
    isDragging?: boolean;
  };
  sortHandle?: ReactNode;
  style?: CSSProperties;
  setNodeRef?: (node: HTMLDivElement | null) => void;
  renderActions?: (props: FieldListTableActionProps<TField>) => ReactNode;
  onDetailsOpen: () => void;
};

function FieldTableRow<TField extends FieldListTableRecord>({
  field,
  index,
  options,
  sortHandle,
  style,
  setNodeRef,
  renderActions,
  onDetailsOpen,
}: FieldTableRowProps<TField>) {
  const {
    showOrderColumn,
    isExpanded,
    isSortingDisabled,
    showSortSequenceInSubtitle,
    isDragging,
  } = options;
  const fieldCode = getFieldCode(field);
  const description = getFieldDescription(field) || "No description available.";
  const [dataTypeBadge, positionBadge, contentTypeBadge] =
    getFieldBadgeData(field);
  const updatedLabel = getDateValue(field.updated_at, "dd MMM yy");
  const createdLabel = getDateValue(field.created_at, "dd MMM yy");
  const isStandard = getFieldIsStandard(field);
  const auditLabel = updatedLabel
    ? `Updated ${updatedLabel}`
    : createdLabel
      ? `Created ${createdLabel}`
      : "";
  const auditSubLabel = field.created_by
    ? `Created by ${field.created_by}`
    : showSortSequenceInSubtitle && field.sort_sequence
      ? `Sort ${field.sort_sequence}`
      : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "relative z-20 opacity-80")}
    >
      <div
        className={cn(
          "transition-[background-color,box-shadow,opacity,transform] duration-150 ease-out hover:bg-muted/25",
          isExpanded && "bg-muted/15",
          isStandard && "bg-primary/[0.025]",
          isDragging && "bg-primary/5 shadow-md",
        )}
      >
        <div
          className={cn(
            "grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5",
            getDesktopGridClass(showOrderColumn),
          )}
        >
          {showOrderColumn ? (
            <>
              {sortHandle ?? <span className="hidden size-7 md:block" />}
              <div className="hidden size-7 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground md:flex">
                {index + 1}
              </div>
            </>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="truncate text-[13px] font-semibold text-foreground">
                {getFieldLabel(field)}
              </h3>
            </div>
            <p className="mt-1 line-clamp-2 whitespace-normal break-words text-[13px] leading-5 text-foreground">
              {description}
            </p>
            {auditLabel || auditSubLabel ? (
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {auditLabel && auditSubLabel
                  ? `${auditLabel} · ${auditSubLabel}`
                  : auditLabel || auditSubLabel}
              </p>
            ) : null}
            <div className="mt-2 md:hidden">
              <div className="flex flex-wrap gap-1.5">
                <FieldBadge badge={contentTypeBadge} />
              </div>
            </div>
          </div>

          <div className="hidden min-w-0 md:block">
            <FieldBadge badge={dataTypeBadge} />
          </div>

          <div className="hidden min-w-0 md:block">
            <FieldBadge badge={positionBadge} />
          </div>

          <div className="hidden min-w-0 md:block">
            <FieldBadge badge={contentTypeBadge} />
          </div>

          <ButtonGroup className="min-w-0 justify-center justify-self-center">
            {renderActions?.({
              field,
              fieldCode,
              isExpanded,
              isSortingDisabled,
            })}

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="View field details"
              className="size-7"
              onClick={onDetailsOpen}
            >
              <Eye className="size-4" />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}

function SortableFieldTableRow<TField extends FieldListTableRecord>({
  field,
  ...props
}: Omit<
  FieldTableRowProps<TField>,
  "sortHandle" | "style" | "setNodeRef"
>) {
  const fieldCode = getFieldCode(field);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: fieldCode,
    disabled: props.options.isSortingDisabled,
  });

  return (
    <FieldTableRow
      {...props}
      field={field}
      options={{
        ...props.options,
        isDragging,
      }}
      setNodeRef={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      sortHandle={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={props.options.isSortingDisabled}
          className="hidden size-7 cursor-grab text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed md:inline-flex"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
          <span className="sr-only">Drag field</span>
        </Button>
      }
    />
  );
}

function FieldRows<TField extends FieldListTableRecord>({
  fields,
  showOrderColumn,
  sortable,
  isSortingDisabled,
  showSortSequenceInSubtitle,
  selectedFieldCode,
  setSelectedFieldCode,
  renderActions,
}: {
  fields: TField[];
  showOrderColumn: boolean;
  sortable: boolean;
  isSortingDisabled: boolean;
  showSortSequenceInSubtitle: boolean;
  selectedFieldCode: string | null;
  setSelectedFieldCode: (fieldCode: string | null) => void;
  renderActions?: (props: FieldListTableActionProps<TField>) => ReactNode;
}) {
  return (
    <div className="divide-y">
      {fields.map((field, index) => {
        const fieldCode = getFieldCode(field);
        const rowProps = {
          field,
          index,
          options: {
            showOrderColumn,
            isExpanded: selectedFieldCode === fieldCode,
            isSortingDisabled,
            showSortSequenceInSubtitle,
          },
          renderActions,
          onDetailsOpen: () => setSelectedFieldCode(fieldCode),
        };

        return sortable ? (
          <SortableFieldTableRow key={fieldCode} {...rowProps} />
        ) : (
          <FieldTableRow key={fieldCode} {...rowProps} />
        );
      })}
    </div>
  );
}

function FieldTableHeader({
  showOrderColumn,
  actionsColumnLabel,
}: {
  showOrderColumn: boolean;
  actionsColumnLabel: string;
}) {
  return (
    <div
      className={cn(
        "hidden items-center gap-2 border-b bg-muted/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-foreground/75 md:grid",
        getDesktopGridClass(showOrderColumn),
      )}
    >
      {showOrderColumn ? (
        <>
          <span className="size-7" />
          <span>Order</span>
        </>
      ) : null}
      <span>Field</span>
      <span>Type</span>
      <span>Position</span>
      <span>Content</span>
      <span className="justify-self-center text-center">
        {actionsColumnLabel}
      </span>
    </div>
  );
}

function FieldTableSkeleton({
  showOrderColumn,
}: {
  showOrderColumn: boolean;
}) {
  return (
    <div className="divide-y">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5",
            getDesktopGridClass(showOrderColumn),
          )}
        >
          {showOrderColumn ? (
            <>
              <Skeleton className="hidden size-7 rounded-md md:block" />
              <Skeleton className="hidden size-7 rounded-md md:block" />
            </>
          ) : null}
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-44 rounded" />
            <Skeleton className="h-3 w-full max-w-md rounded" />
            <Skeleton className="h-3 w-32 rounded" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
          </div>
          <Skeleton className="hidden h-5 w-14 rounded-md md:block" />
          <Skeleton className="hidden h-5 w-16 rounded-md md:block" />
          <Skeleton className="hidden h-5 w-20 rounded-md md:block" />
          <div className="flex items-center justify-center gap-1 justify-self-center">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="size-7 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldTableEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-4">
      <EmptyState
        icon={ListChecks}
        title={title}
        description={description}
        className="min-h-48 border-0 bg-transparent"
      />
    </div>
  );
}
export function FieldsListTable<TField extends FieldListTableRecord>({
  fields = EMPTY_FIELDS,
  categories = EMPTY_CATEGORIES,
  title,
  description,
  totalFields,
  options = EMPTY_OPTIONS,
  emptyTitle = "No fields found",
  emptyDescription = "No fields match the current filters.",
  actionsColumnLabel = "Actions",
  renderActions,
  onSortOrderChange,
  className,
}: FieldListTableProps<TField>) {
  const {
    isLoading = false,
    sortable = false,
    showOrderColumn,
    isSortOrderSaving = false,
    isSortingDisabled = false,
    showSortSequenceInSubtitle = true,
    scrollable = false,
  } = options;

  const normalizedFields = useMemo(
    () => fields.filter((field) => Boolean(getFieldCode(field))),
    [fields],
  );
  const normalizedFieldCodes = useMemo(
    () => getFieldCodes(normalizedFields),
    [normalizedFields],
  );
  const normalizedFieldCodesKey = useMemo(
    () => normalizedFieldCodes.join("\u001f"),
    [normalizedFieldCodes],
  );
  const normalizedFieldByCode = useMemo(() => {
    const fieldsByCode = new Map<string, TField>();

    normalizedFields.forEach((field) => {
      const fieldCode = getFieldCode(field);

      if (fieldCode) {
        fieldsByCode.set(fieldCode, field);
      }
    });

    return fieldsByCode;
  }, [normalizedFields]);
  const [orderedFieldCodesState, setOrderedFieldCodesState] = useState<{
    baseKey: string;
    fieldCodes: string[];
  } | null>(null);
  const [selectedFieldCode, setSelectedFieldCode] = useState<string | null>(
    null,
  );
  const dragStartFieldCodesRef = useRef<string[]>([]);
  const resolvedShowOrderColumn = showOrderColumn ?? sortable;
  const resolvedSortingDisabled = !sortable || isSortingDisabled || isSortOrderSaving;
  const orderedFields = useMemo(() => {
    if (
      !orderedFieldCodesState ||
      orderedFieldCodesState.baseKey !== normalizedFieldCodesKey
    ) {
      return normalizedFields;
    }

    const nextFields = orderedFieldCodesState.fieldCodes
      .map((fieldCode) => normalizedFieldByCode.get(fieldCode))
      .filter((field): field is TField => Boolean(field));

    return nextFields.length === normalizedFields.length
      ? nextFields
      : normalizedFields;
  }, [
    normalizedFieldByCode,
    normalizedFieldCodesKey,
    normalizedFields,
    orderedFieldCodesState,
  ]);
  const sortableFieldCodes = useMemo(
    () => getFieldCodes(orderedFields),
    [orderedFields],
  );
  const categoryByCode = useMemo(() => getCategoryByCode(categories), [categories]);
  const selectedField = selectedFieldCode
    ? normalizedFieldByCode.get(selectedFieldCode) ?? null
    : null;
  const selectedCategory = selectedField
    ? getFieldCategory(selectedField, categoryByCode)
    : undefined;
  const fieldCount = totalFields ?? normalizedFields.length;
  const fieldCountLabel = `${fieldCount} ${fieldCount === 1 ? "field" : "fields"}`;
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = () => {
    if (resolvedSortingDisabled) {
      return;
    }

    dragStartFieldCodesRef.current = getFieldCodes(orderedFields);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (resolvedSortingDisabled) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      dragStartFieldCodesRef.current = [];
      return;
    }

    const currentFields = orderedFields;
    const oldIndex = currentFields.findIndex(
      (field) => getFieldCode(field) === String(active.id),
    );
    const newIndex = currentFields.findIndex(
      (field) => getFieldCode(field) === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) {
      dragStartFieldCodesRef.current = [];
      return;
    }

    const nextFields = arrayMove(currentFields, oldIndex, newIndex);
    const fieldCodes = getFieldCodes(nextFields);

    if (
      fieldCodes.length &&
      !areFieldCodesEqual(dragStartFieldCodesRef.current, fieldCodes)
    ) {
      setOrderedFieldCodesState({
        baseKey: normalizedFieldCodesKey,
        fieldCodes,
      });
      onSortOrderChange?.(fieldCodes);
    }

    dragStartFieldCodesRef.current = [];
  };

  const tableBody = isLoading ? (
    <FieldTableSkeleton showOrderColumn={resolvedShowOrderColumn} />
  ) : orderedFields.length ? (
    <FieldRows
      fields={orderedFields}
      showOrderColumn={resolvedShowOrderColumn}
      sortable={sortable}
      isSortingDisabled={resolvedSortingDisabled}
      showSortSequenceInSubtitle={showSortSequenceInSubtitle}
      selectedFieldCode={selectedFieldCode}
      setSelectedFieldCode={setSelectedFieldCode}
      renderActions={renderActions}
    />
  ) : (
    <FieldTableEmpty title={emptyTitle} description={emptyDescription} />
  );

  const table = (
    <section
      className={cn(
        "overflow-hidden rounded-md border bg-card shadow-xs",
        scrollable && "flex h-full min-h-0 flex-col",
        className,
      )}
    >
      {title || description ? (
        <header className="shrink-0 border-b px-4 py-4">
          {title ? (
            <h2 className="truncate text-base font-semibold leading-5 text-foreground">
              {title}
            </h2>
          ) : null}
          <p className="mt-1 text-sm leading-4 text-muted-foreground">
            {isLoading ? "Loading fields" : description ?? fieldCountLabel}
          </p>
        </header>
      ) : null}

      <FieldTableHeader
        showOrderColumn={resolvedShowOrderColumn}
        actionsColumnLabel={actionsColumnLabel}
      />

      {scrollable ? (
        <ScrollArea className="min-h-0 flex-1">{tableBody}</ScrollArea>
      ) : (
        tableBody
      )}
    </section>
  );

  const tableWithDrawer = (
    <>
      {table}
      <FieldDetailsDrawer
        open={Boolean(selectedField)}
        field={selectedField}
        category={selectedCategory}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFieldCode(null);
          }
        }}
      />
    </>
  );

  if (!sortable) {
    return tableWithDrawer;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={resolvedSortingDisabled ? undefined : handleDragStart}
      onDragEnd={resolvedSortingDisabled ? undefined : handleDragEnd}
    >
      <SortableContext
        items={sortableFieldCodes}
        strategy={verticalListSortingStrategy}
      >
        {tableWithDrawer}
      </SortableContext>
    </DndContext>
  );
}

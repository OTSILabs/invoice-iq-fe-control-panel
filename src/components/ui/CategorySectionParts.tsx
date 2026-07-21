import * as React from "react";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { GripVertical, Info, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

import type { DragEndEvent } from "@dnd-kit/core";
import type {
  CategorizedFieldSelectorItem,
  CategorizedFieldSelectorCategory,
} from "./categorized-field-selector.utils";

type DragHandleProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Record<string, unknown>;

function DetailSection({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-border/40 py-2 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="text-xs leading-5 text-foreground">{value}</div>
    </div>
  );
}

function FieldDetailsHoverCard({
  item,
}: {
  item: CategorizedFieldSelectorItem;
}) {
  const isHeader = item.metadata?.position === "Header";
  const typeLabel = item.metadata?.type || item.metadata?.contentType;

  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
          onClick={(event) => event.stopPropagation()}
        >
          <Info className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Details</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        className="grid w-80 gap-2 border-border/80 p-3.5 shadow-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-semibold text-foreground">
              {item.label}
            </h4>
            <code className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground/90">
              {item.id}
            </code>
          </div>
          {typeLabel ? (
            <Badge variant="outline" className="h-5 px-2 text-[10px] font-medium">
              {String(typeLabel)}
            </Badge>
          ) : null}
        </div>

        {item.description ? (
          <p className="border-t border-border/40 pt-2 text-xs leading-4.5 text-muted-foreground">
            {item.description}
          </p>
        ) : null}

        <DetailSection
          label="Document Location"
          value={isHeader ? "Header (Global properties)" : "Line Item (Grid table)"}
        />

        {item.metadata?.prompt ? (
          <DetailSection
            label="Extraction Prompt"
            value={
              <span className="italic">{`“${String(item.metadata.prompt)}”`}</span>
            }
          />
        ) : null}

        {Array.isArray(item.metadata?.aliases) && item.metadata.aliases.length ? (
          <DetailSection
            label="Alternate Names / Aliases"
            value={
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {item.metadata.aliases.map((alias: string) => (
                  <Badge key={alias} variant="outline" className="h-4.5 rounded-sm px-1 text-[10px] font-normal">
                    {alias}
                  </Badge>
                ))}
              </div>
            }
          />
        ) : null}

        {Array.isArray(item.metadata?.examples) && item.metadata.examples.length ? (
          <DetailSection
            label="Extraction Examples"
            value={
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {item.metadata.examples.map((example: string) => (
                  <Badge
                    key={example}
                    variant="outline"
                    className="h-4.5 rounded-sm border-emerald-500/20 bg-emerald-500/5 px-1 text-[10px] font-normal text-emerald-600 dark:text-emerald-400"
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            }
          />
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}

export function FieldRow({
  item,
  selected,
  disabled,
  dragDisabled,
  onToggle,
  onEdit,
  dragHandleProps,
  isDragging,
  readonly,
}: {
  item: CategorizedFieldSelectorItem;
  selected: boolean;
  disabled?: boolean;
  dragDisabled?: boolean;
  onToggle: (itemId: string) => void;
  onEdit?: (item: CategorizedFieldSelectorItem) => void;
  dragHandleProps?: DragHandleProps;
  isDragging?: boolean;
  readonly?: boolean;
}) {
  const typeLabel = item.metadata?.type || item.metadata?.contentType;

//   function handleToggle(event?: React.MouseEvent<HTMLElement>) {
//     event?.stopPropagation();

//     if (!disabled) {
//       onToggle(item.id);
//     }
//   }

//   function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
//     if (disabled) {
//       return;
//     }

//     if (event.key === " " || event.key === "Enter") {
//       event.preventDefault();
//       onToggle(item.id);
//     }
//   }

  return (
    <li
      className={cn(
        "group rounded-md border border-border/80 bg-card px-2.5 py-2 shadow-[0_1px_1px_rgba(15,23,42,0.03)] outline-none transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
        isDragging && "relative z-20 opacity-80 shadow-md",
        !readonly && disabled && "cursor-not-allowed opacity-55",
      )}
    >
      <div className="flex items-center gap-2">
        {dragHandleProps ? (
          <Button
            {...dragHandleProps}
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Drag ${item.label}`}
            disabled={dragDisabled}
            className={cn(
              "size-6 shrink-0 cursor-grab rounded-sm text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed",
              dragHandleProps?.className,
            )}
            onClick={(event:any) => event.stopPropagation()}
          >
            <GripVertical className="size-3.5" aria-hidden="true" />
          </Button>
        ) : null}

        <button
          type="button"
          role="option"
          aria-selected={selected}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && !readonly) onToggle(item.id);
          }}
          className={cn("min-w-0 flex-1 text-left", readonly ? "cursor-default" : "cursor-pointer")}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-xs font-medium leading-5 text-foreground">
              {item.label}
            </span>
            {item.metadata?.position ? (
              <Badge variant="outline" className="h-4 shrink-0 px-1.5 text-[10px]">
                {item.metadata.position}
              </Badge>
            ) : null}
          </div>

          {item.description ? (
            <div className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
              {item.description}
            </div>
          ) : null}
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          {typeLabel ? (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {String(typeLabel)}
            </Badge>
          ) : null}
          <FieldDetailsHoverCard item={item} />
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Edit ${item.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(item);
              }}
              className="size-6 shrink-0 rounded-sm text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
          )}
          {!readonly ? (
            <Switch
              size="sm"
              checked={selected}
              disabled={disabled}
              aria-label={`${selected ? "Remove" : "Select"} ${item.label}`}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={() => {
                if (!disabled) {
                  onToggle(item.id);
                }
              }}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}

function SortableFieldRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: (props: {
    dragHandleProps: DragHandleProps | undefined;
    isDragging: boolean;
  }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {children({
        dragHandleProps: disabled ? undefined : { ...attributes, ...listeners },
        isDragging,
      })}
    </div>
  );
}

export function CategoryFieldsList({
  visibleItems,
  sortableItemIds,
  category,
  selectedSet,
  isLocked,
  readonly,
  sensors,
  handleDragEnd,
  toggleItem,
  onEdit,
}: {
  visibleItems: CategorizedFieldSelectorItem[];
  sortableItemIds: string[];
  category: CategorizedFieldSelectorCategory;
  selectedSet: Set<string>;
  isLocked: boolean;
  readonly?: boolean;
  sensors: any;
  handleDragEnd: (event: DragEndEvent) => void;
  toggleItem: (itemId: string) => void;
  onEdit?: (item: CategorizedFieldSelectorItem) => void;
}) {
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid gap-1.5">
        <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
          <ul className="grid gap-1.5 p-3 list-none">
            {visibleItems.map((item) => {
              const itemSelectionDisabled = isLocked || item.disabled || category.disabled;

              return (
                <SortableFieldRow key={item.id} id={item.id} disabled={isLocked}>
                  {({ dragHandleProps, isDragging }) => (
                    <FieldRow
                      item={item}
                      selected={selectedSet.has(item.id)}
                      disabled={itemSelectionDisabled}
                      dragDisabled={isLocked}
                      dragHandleProps={dragHandleProps}
                      isDragging={isDragging}
                      readonly={readonly}
                      onToggle={toggleItem}
                      onEdit={onEdit}
                    />
                  )}
                </SortableFieldRow>
              );
            })}
          </ul>
        </SortableContext>
      </div>
    </DndContext>
  );
}


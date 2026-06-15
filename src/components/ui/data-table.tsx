"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  Column,
  Header,
  Row,
  Updater,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";
import { PaginationComponent } from "./pagination-component";
import { Input } from "./input";
import { CopyToClipboard } from "./copy-to-clipboard";
import { Link } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./hover-card";
import { ArrowDown, ArrowUp, LinkIcon, Search, FileX2 } from "lucide-react";

export type CustomColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  rowClassName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns?: CustomColumnDef<TData, any>[];
  filterFn?: unknown;
}

function getColumnStyle<TData, TValue>(column: Column<TData, TValue>): React.CSSProperties {
  const columnDef = column.columnDef as CustomColumnDef<TData, TValue>;
  const width = columnDef.width ?? `${column.getSize()}px`;
  const minWidth = columnDef.minWidth
    ? columnDef.minWidth
    : `${columnDef.minSize ?? column.getSize()}px`;
  const maxWidth = columnDef.maxWidth
    ? columnDef.maxWidth
    : columnDef.maxSize
      ? `${columnDef.maxSize}px`
      : undefined;

  return {
    width,
    minWidth,
    maxWidth,
  };
}

function parsePixelSize(value: string | number | undefined): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;

  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : undefined;
}

function withColumnSizing<TData, TValue>(
  columnDefs: CustomColumnDef<TData, TValue>[]
): CustomColumnDef<TData, TValue>[] {
  return columnDefs.map((columnDef) => {
    const parsedWidth = parsePixelSize(columnDef.width);
    const parsedMinWidth = parsePixelSize(columnDef.minWidth);
    const parsedMaxWidth = parsePixelSize(columnDef.maxWidth);

    return {
      ...columnDef,
      ...(parsedWidth && columnDef.size == null ? { size: parsedWidth } : {}),
      ...(parsedMinWidth && columnDef.minSize == null ? { minSize: parsedMinWidth } : {}),
      ...(parsedMaxWidth && columnDef.maxSize == null ? { maxSize: parsedMaxWidth } : {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(columnDef.columns ? { columns: withColumnSizing(columnDef.columns as any) } : {}),
    };
  });
}

function getPinnedColumnStyle<TData, TValue>(column: Column<TData, TValue>): React.CSSProperties | undefined {
  const pinnedSide = column.getIsPinned();

  if (!pinnedSide) return undefined;

  const isLastLeftPinnedColumn =
    pinnedSide === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    pinnedSide === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow:
      isLastLeftPinnedColumn
        ? "-4px 0 4px -4px hsl(var(--foreground) / 0.15) inset"
        : isFirstRightPinnedColumn
          ? "4px 0 4px -4px hsl(var(--foreground) / 0.15) inset"
          : undefined,
    opacity: 0.99,
    position: "sticky",
    left:
      pinnedSide === "left" ? `${column.getStart("left")}px` : undefined,
    right:
      pinnedSide === "right" ? `${column.getAfter("right")}px` : undefined,
    width: `${column.getSize()}px`,
    zIndex: 1,
  };
}

function getPinnedColumnClassName<TData, TValue>(column: Column<TData, TValue>): string | undefined {
  const pinnedSide = column.getIsPinned();

  if (!pinnedSide) return undefined;

  return cn(
    "bg-card",
    pinnedSide === "right" && column.getIsFirstColumn("right") && "border-l border-border/80",
    pinnedSide === "left" && column.getIsLastColumn("left") && "border-r border-border/80",
  );
}

export interface DataTableProps<TData, TValue = unknown> {
  data: TData[];
  columns: CustomColumnDef<TData, TValue>[];
  isLoading?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  totalItems?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  manualFiltering?: boolean;
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  onRowSelectionChange?: (rowSelection: Updater<RowSelectionState>) => void;
  rowSelection?: RowSelectionState;
  onRowClick?: (rowData: TData, row: Row<TData>) => void;
  className?: string;
  containerClassName?: string;
  tableContainerClassName?: string;
  columnPinning?: { left?: string[]; right?: string[] };
  stickyHeader?: boolean;
  tableScrollClassName?: string;
  fillAvailableHeight?: boolean;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<TData, TValue = unknown>({
  data,
  columns,
  isLoading,
  enablePagination,
  pageSize = 10,
  pageSizeOptions,
  totalItems = 0,
  page = 1,
  onPageChange = () => {},
  onPageSizeChange,
  manualFiltering = true,
  manualSorting = false,
  sorting,
  onSortingChange,
  onFilterChange,
  onRowSelectionChange,
  rowSelection = {},
  onRowClick,
  className,
  containerClassName,
  tableContainerClassName,
  columnPinning = { left: [], right: [] },
  stickyHeader = false,
  tableScrollClassName,
  fillAvailableHeight = false,
  emptyState,
  emptyMessage,
}: DataTableProps<TData, TValue>) {
  "use no memo";
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const tableColumns = useMemo(() => withColumnSizing(columns), [columns]);
  const hasPinnedColumns = Boolean(columnPinning.left?.length || columnPinning.right?.length);
  const sortingState = sorting ?? internalSorting;

  const handleSortingChange = (updater: Updater<SortingState>) => {
    const nextSorting =
      typeof updater === "function" ? updater(sortingState) : updater;

    if (sorting === undefined) {
      setInternalSorting(nextSorting);
    }

    onSortingChange?.(nextSorting);
  };

  const table = useReactTable({
    data,
    columns: tableColumns,
    defaultColumn: {
      enableColumnFilter: false,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    manualPagination: true,
    manualFiltering: manualFiltering,
    manualSorting,
    enableColumnFilters: true,
    enableSorting: true,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(nextFilters);
      onFilterChange?.(nextFilters);
    },

    onRowSelectionChange: onRowSelectionChange,
    onSortingChange: handleSortingChange,
    initialState: {
      columnPinning,
    },
    state: {
      columnFilters,
      rowSelection,
      sorting: sortingState,
    },
  });

  return (
    <div
      ref={tableContainerRef}
      className={cn(
        "bg-card text-card-foreground flex flex-col min-w-full overflow-hidden transition-all duration-200",
        fillAvailableHeight && "flex-1 min-h-0",
        containerClassName,
      )}
    >
      <Table
        className={cn(
          "table-fixed border-collapse",
          hasPinnedColumns && "border-separate border-spacing-0",
          className
        )}
        containerClassName={cn(
          "relative overflow-auto border border-border/60 rounded-xl bg-background/50 backdrop-blur-sm",
          tableContainerClassName,
          fillAvailableHeight && "min-h-0 flex-1",
          stickyHeader && "overflow-auto",
          tableScrollClassName
        )}
      >
        <TableHeader className="bg-muted/40 hover:bg-muted/50 border-b border-border/80 transition-colors">
          {table.getHeaderGroups().map((headerGroup) => {
            const isFilterable = headerGroup.headers.some((header) =>
              header.column.getCanFilter(),
            );

            return (
              <Fragment key={headerGroup.id}>
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const customColumnDef = header.column.columnDef as CustomColumnDef<TData, TValue>;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "px-4 py-3 bg-muted/30 font-semibold text-slate-700",
                          stickyHeader && "sticky top-0 z-10",
                          getPinnedColumnClassName(header.column),
                          customColumnDef.rowClassName,
                        )}
                        style={{
                          ...getColumnStyle(header.column),
                          ...getPinnedColumnStyle(header.column),
                          zIndex: stickyHeader ? (header.column.getIsPinned() ? 31 : 30) : header.column.getIsPinned() ? 3 : undefined,
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <ColumnHeader header={header} />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
                {isFilterable && (
                  <TableRow className="hover:bg-transparent border-t border-border/40">
                    {headerGroup.headers.map((header) => {
                      const customColumnDef = header.column.columnDef as CustomColumnDef<TData, TValue>;
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "bg-muted/10 px-4 py-2",
                            stickyHeader && "sticky top-11 z-10",
                            getPinnedColumnClassName(header.column),
                            customColumnDef.rowClassName,
                          )}
                          style={{
                            ...getColumnStyle(header.column),
                            ...getPinnedColumnStyle(header.column),
                            zIndex: stickyHeader ? (header.column.getIsPinned() ? 31 : 30) : header.column.getIsPinned() ? 3 : undefined,
                          }}
                        >
                          {header.column.getCanFilter() && (
                            <Filter
                              filter={header.column.getFilterValue() as string}
                              onChange={(val) => header.column.setFilterValue(val)}
                              type={customColumnDef.filterFn as string}
                              header={customColumnDef.header as string}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {columns.map((col, colIndex) => {
                  const customColumnDef = col as CustomColumnDef<TData, TValue>;
                  return (
                    <TableCell key={colIndex} className={cn("p-4", customColumnDef.rowClassName)}>
                      <Skeleton className={cn(
                        "h-4 rounded-md animate-pulse bg-muted-foreground/10",
                        colIndex === 0 ? "w-2/3" : colIndex === 1 ? "w-1/2" : "w-3/4"
                      )} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const isClickable = Boolean(onRowClick);
              const customOriginal = row.original as { rowClassName?: string };

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "group/row border-b border-border/40 transition-colors hover:bg-muted/20",
                    customOriginal?.rowClassName,
                    isClickable && "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  )}
                  role={isClickable ? "link" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onClick={isClickable ? () => onRowClick?.(row.original, row) : undefined}
                  onKeyDown={
                    isClickable
                      ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick?.(row.original, row);
                        }
                      }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-4 py-3 text-slate-600 font-normal transition-colors group-hover/row:text-foreground",
                        getPinnedColumnClassName(cell.column),
                      )}
                      style={{
                        ...getColumnStyle(cell.column),
                        ...getPinnedColumnStyle(cell.column),
                        zIndex: cell.column.getIsPinned() ? 2 : undefined,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-48 text-center p-0">
                {emptyState || (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-muted/40 p-4 rounded-full mb-3 text-muted-foreground/75 scale-95 transition-transform duration-300 hover:scale-100">
                      <FileX2 className="size-8 animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {emptyMessage || "No records found"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-70 mx-auto leading-relaxed">
                      We couldn't find any data matching your request. Try adjusting your filters.
                    </p>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaginationComponent
        currentPage={page}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={(page) => {
          onPageChange(page);
          tableContainerRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
        onPageSizeChange={onPageSizeChange}
        enablePagination={enablePagination}
        className="justify-end border-t border-border/40 bg-card py-3 px-4"
      />
    </div>
  );
}

interface FilterProps {
  filter: string;
  onChange: (value: string) => void;
  type: string;
  header: string;
}

function Filter({ filter, onChange, type, header }: FilterProps) {
  return (
    <div className="relative flex items-center w-full min-w-28 max-w-xs group">
      <Search className="absolute left-2.5 size-3 text-muted-foreground transition-colors group-hover:text-foreground/70" />
      <Input
        type={type === "includesDate" ? "date" : "text"}
        value={filter || ""}
        placeholder={`Filter ${header}...`}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-8 text-xs bg-slate-50/50 border-border/80 focus:bg-background transition-all rounded-lg"
      />
    </div>
  );
}

interface ColumnHeaderProps<TData, TValue> {
  header: Header<TData, TValue>;
}

function ColumnHeader<TData, TValue>({ header }: ColumnHeaderProps<TData, TValue>) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : null;
  const content = flexRender(header.column.columnDef.header, header.getContext());
  const customColumnDef = header.column.columnDef as CustomColumnDef<TData, TValue>;

  if (!canSort) {
    return <span className="text-xs font-semibold tracking-wider text-muted-foreground">{content}</span>;
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-1.5 text-left text-xs font-semibold tracking-wider transition-colors cursor-pointer group/btn",
        sorted ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground",
        customColumnDef.rowClassName === "text-center" && "justify-center text-center"
      )}
      onClick={header.column.getToggleSortingHandler()}
    >
      <span className="min-w-0 truncate">{content}</span>
      <div className={cn(
        "flex items-center justify-center p-0.5 rounded transition-colors",
        sorted ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover/btn:text-foreground"
      )}>
        {SortIcon ? (
          <SortIcon className="size-3 shrink-0" />
        ) : (
          <div className="opacity-0 group-hover/btn:opacity-100 transition-opacity">
            <ArrowUp className="size-3 shrink-0 text-muted-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}

interface RowRenderLinkProps {
  showLink?: boolean;
  href: string;
  value: React.ReactNode;
  header?: string;
  allowCopy?: boolean;
  target?: string;
  urlText?: string;
  valueContainerClassName?: string;
  valueTextClassName?: string;
}

export function RowRenderLink({
  showLink = true,
  href,
  value,
  header,
  allowCopy = true,
  target = "_self",
  urlText = "Click to view  ",
  valueContainerClassName = "max-w-24",
  valueTextClassName = "max-w-32",
}: RowRenderLinkProps) {
  return (
    <div className="flex items-center gap-1">
      <div className={cn(valueContainerClassName, "truncate")}>
        {showLink ? (
          <Link to={href} className="underline text-primary hover:text-primary-hover font-medium" target={target}>
            <RowCell
              value={value}
              href={href}
              header={header}
              urlText={urlText}
              target={target}
              className={valueTextClassName}
            />
          </Link>
        ) : (
          <RowCell
            value={value}
            header={header}
            urlText={urlText}
            className={valueTextClassName}
          />
        )}
      </div>
      {allowCopy && <CopyToClipboard value={value} />}
    </div>
  );
}

interface RowCellProps {
  value: React.ReactNode;
  className?: string;
  header?: string;
  href?: string;
  urlText?: string;
  target?: string;
}

export function RowCell({
  value,
  className,
  header,
  href,
  urlText = "View logs",
  target = "_self",
}: RowCellProps) {
  const record = value as unknown as Record<string, string>;
  const displayValue = typeof value === "object" && value !== null
    ? (record.full_name || record.username || record.email || JSON.stringify(value))
    : value;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className={cn("max-w-32 truncate cursor-pointer hover:underline text-slate-700 font-medium", className)}>
          {displayValue}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="space-y-2 p-0 shadow-xl border border-border/80 bg-popover/95 backdrop-blur-md max-w-sm rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4">
          {header && <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{header}</h4>}
          <div className="text-sm font-medium text-foreground break-all mt-1.5 leading-relaxed">{displayValue}</div>
        </div>

        {href && (
          <Link
            to={href}
            target={target}
            className="text-xs bg-muted/60 hover:bg-muted/80 text-primary p-3 flex gap-1.5 items-center justify-center transition-colors border-t border-border/40 font-semibold"
          >
            <LinkIcon className="size-3.5" />
            {urlText}
          </Link>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

import type { FilterProps } from "@/types";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
  Table as ReactTable,
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

import { ArrowDown, ArrowUp, Search, FileX2 } from "lucide-react";
import { Button } from "./button";

export type CustomColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  rowClassName?: string;
  columns?: CustomColumnDef<TData, any>[];
  filterFn?: unknown;
}

const DEFAULT_ROW_SELECTION: RowSelectionState = {};
const DEFAULT_COLUMN_PINNING = { left: [], right: [] };

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
      ...(columnDef.columns ? { columns: withColumnSizing(columnDef.columns as any) } : {}),
    };
  });
}

function getPinnedColumnStyle<TData, TValue>(column: Column<TData, TValue>): React.CSSProperties | undefined {
  const pinnedSide = column.getIsPinned();

  if (!pinnedSide) return undefined;

  return {
    // removed boxShadow to avoid visible inset shadows on pinned columns
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
    pinnedSide === "right" && column.getIsFirstColumn("right") && "border-l border-border/45",
    pinnedSide === "left" && column.getIsLastColumn("left") && "border-r border-border/45",
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
  manualPagination?: boolean;
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
  enableSorting?: boolean;
}

export function DataTable<TData, TValue = unknown>({
  data,
  columns,
  isLoading,
  enablePagination,
  pageSize = 10,
  pageSizeOptions,
  totalItems = data.length,
  page = 1,
  onPageChange = () => {},
  onPageSizeChange,
  manualPagination = false,
  manualFiltering = true,
  manualSorting = false,
  sorting,
  onSortingChange,
  onFilterChange,
  onRowSelectionChange,
  rowSelection = DEFAULT_ROW_SELECTION,
  onRowClick,
  className,
  containerClassName,
  tableContainerClassName,
  columnPinning = DEFAULT_COLUMN_PINNING,
  stickyHeader = false,
  tableScrollClassName,
  fillAvailableHeight = false,
  emptyState,
  enableSorting = false,
  emptyMessage,
}: DataTableProps<TData, TValue>) {
  "use no memo";
  "use no compiler";
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const tableColumns = useMemo(() => withColumnSizing(columns), [columns]);
  const hasPinnedColumns = Boolean(columnPinning.left?.length || columnPinning.right?.length);
  const sortingState = sorting ?? internalSorting;

  const isControlled = manualPagination;

  const [clientPagination, setClientPagination] = useState(() => ({
    pageIndex: page - 1,
    pageSize,
  }));

  const prevDataRef = useRef(data);
  useEffect(() => {
    if (!isControlled && data !== prevDataRef.current) {
      prevDataRef.current = data;
      setClientPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [data, isControlled]);

  const paginationState = isControlled
    ? { pageIndex: page - 1, pageSize }
    : clientPagination;

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
    manualPagination: manualPagination,
    manualFiltering: manualFiltering,
    manualSorting,
    enableColumnFilters: true,
    enableSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(nextFilters);
      onFilterChange?.(nextFilters);
    },
    onPaginationChange: (updater) => {
      const nextPagination = typeof updater === "function"
        ? updater(paginationState)
        : updater;
      if (isControlled) {
        onPageChange(nextPagination.pageIndex + 1);
        if (onPageSizeChange) {
          onPageSizeChange(nextPagination.pageSize);
        }
      } else {
        setClientPagination(nextPagination);
      }
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
      pagination: paginationState,
    },
  });

  return (
    <div
      ref={tableContainerRef}
      className={cn(
        "min-w-full overflow-hidden text-card-foreground flex flex-col transition-[background-color,box-shadow,transform] duration-200",
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
          "relative overflow-x-auto overflow-y-hidden rounded-xl bg-card",
          tableContainerClassName,
          fillAvailableHeight && "min-h-0 flex-1 overflow-y-auto",
          stickyHeader && "overflow-x-auto overflow-y-hidden",
          tableScrollClassName
        )}
      >
        <DataTableHeader
          table={table}
          stickyHeader={stickyHeader}
        />
        <DataTableBody
          table={table}
          columns={columns}
          isLoading={isLoading}
          onRowClick={onRowClick}
          emptyState={emptyState}
          emptyMessage={emptyMessage}
        />
      </Table>
      <PaginationComponent
        currentPage={paginationState.pageIndex + 1}
        totalItems={manualPagination ? totalItems : table.getFilteredRowModel().rows.length}
        pageSize={paginationState.pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={(page) => {
          table.setPageIndex(page - 1);
          const scrollTarget = tableContainerRef.current?.closest(".table-container") || 
                               tableContainerRef.current?.closest(".surface-card") || 
                               tableContainerRef.current;
          if (scrollTarget) {
            const rect = scrollTarget.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const absoluteTop = rect.top + scrollTop;
            if (absoluteTop < 400) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              scrollTarget.scrollIntoView({ behavior: "smooth" });
            }
          }
        }}
        onPageSizeChange={(size) => {
          table.setPageSize(size);
        }}
        enablePagination={enablePagination}
        className="border-t border-border/60 bg-muted/20 px-4 py-3"
      />
    </div>
  );
}

interface DataTableHeaderProps<TData> {
  table: ReactTable<TData>;
  stickyHeader?: boolean;
}

function DataTableHeader<TData, TValue>({
  table,
  stickyHeader = false,
}: DataTableHeaderProps<TData>) {
  return (
    <TableHeader className="border-b border-border/60 bg-muted/45 transition-colors">
      {table.getHeaderGroups().map((headerGroup) => {
        const isFilterable = headerGroup.headers.some((header) =>
          header.column.getCanFilter()
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
                      "h-10 bg-transparent px-4 py-3 text-[0.68rem] font-semibold   text-muted-foreground",
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
  );
}

interface DataTableBodyProps<TData, TValue> {
  table: ReactTable<TData>;
  columns: CustomColumnDef<TData, TValue>[];
  isLoading?: boolean;
  onRowClick?: (rowData: TData, row: Row<TData>) => void;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
}

function DataTableBody<TData, TValue>({
  table,
  columns,
  isLoading,
  onRowClick,
  emptyState,
  emptyMessage,
}: DataTableBodyProps<TData, TValue>) {
  return (
    <TableBody>
      {isLoading ? (
        Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableRow key={rowIndex} className="border-b border-border/35 hover:bg-transparent">
            {columns.map((col, colIndex) => {
              const customColumnDef = col as CustomColumnDef<TData, TValue>;
              return (
                <TableCell key={colIndex} className={cn("p-2", customColumnDef.rowClassName)}>
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
                "group/row border-b border-border/45 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted/50",
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
              {row.getVisibleCells().map((cell) => {
                const customColumnDef = cell.column.columnDef as CustomColumnDef<TData, TValue>;
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-4 text-sm font-normal text-muted-foreground transition-colors truncate group-hover/row:text-foreground",
                      getPinnedColumnClassName(cell.column),
                      customColumnDef.rowClassName,
                    )}
                    style={{
                      ...getColumnStyle(cell.column),
                      ...getPinnedColumnStyle(cell.column),
                      zIndex: cell.column.getIsPinned() ? 2 : undefined,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })
      ) : (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={columns.length} className="h-48 text-center p-0">
            {emptyState || (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-3 rounded-xl bg-background p-3 text-muted-foreground/75 shadow-sm ring-1 ring-border/60">
                  <FileX2 className="size-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">
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
  );
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
        className="h-8 rounded-md bg-background/70 pl-8 text-xs transition-[background-color,box-shadow]"
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
    return <span className="text-[0.68rem] font-semibold  text-muted-foreground">{content}</span>;
  }

  return (
    <Button
      type="button"
      className={cn(
        "group/btn flex w-full  items-center gap-1.5 text-left text-[0.68rem] font-semibold  transition-colors",
        sorted ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground",
        customColumnDef.rowClassName === "text-center" && "justify-center text-center"
      )}
      onClick={header.column.getToggleSortingHandler()}
    >
      <span className="min-w-0 truncate cursor-pointer">{content}</span>
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
    </Button>
  );
}

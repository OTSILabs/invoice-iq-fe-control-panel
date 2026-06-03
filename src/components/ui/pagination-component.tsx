import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export interface PaginationComponentProps {
  currentPage: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  enablePagination?: boolean
  className?: string
}

export function PaginationComponent({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onPageChange,
  onPageSizeChange,
  enablePagination = true,
  className,
}: PaginationComponentProps) {
  if (!enablePagination) return null

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2", className)}>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Total {totalItems} items
        </span>
        {onPageSizeChange && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <NativeSelect
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              size="sm"
            >
              {pageSizeOptions.map((option) => (
                <NativeSelectOption key={option} value={option.toString()}>
                  {option}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
      </div>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) onPageChange(currentPage - 1)
              }}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          <PaginationItem>
            <span className="text-sm font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) onPageChange(currentPage + 1)
              }}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

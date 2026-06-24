
import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
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
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const lastItem = Math.min(currentPage * pageSize, totalItems)

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 'right-ellipsis', totalPages]
    }
    if (currentPage >= totalPages - 2) {
      return [1, 'left-ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, 'left-ellipsis', currentPage - 1, currentPage, currentPage + 1, 'right-ellipsis', totalPages]
  }

  const pages = getPageNumbers()

  return (
    <div className={cn("flex flex-col items-center justify-between gap-3 px-2 py-4 sm:flex-row", className)}>
      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground sm:flex-row sm:gap-4">
        <span className="font-medium">
          Showing <span className="text-foreground">{firstItem}-{lastItem}</span> of{" "}
          <span className="text-foreground">{totalItems}</span>
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

          {pages.map((p) => (
            <PaginationItem key={p}>
              {String(p).includes('ellipsis') ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={currentPage === p}
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage !== p) onPageChange(p as number)
                  }}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

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

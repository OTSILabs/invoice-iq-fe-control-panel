import { useState, useCallback, useMemo } from "react"
import type { UsePaginationOptions } from "@/types"

export type { UsePaginationOptions }

export function usePagination<TFilter extends Record<string, any> = Record<string, any>>(
  options: UsePaginationOptions<TFilter> = {}
) {
  const { initialPageSize = 10, initialSearch = "", initialFilters = {} as TFilter } = options

  // 0-indexed page state for API offset calculation
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [search, setSearchState] = useState(initialSearch)
  const [filters, setFiltersState] = useState<TFilter>(initialFilters)

  // Handlers that automatically reset page index to 0 when search or filters change
  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch)
    setPage(0)
  }, [])

  const setFilters = useCallback((key: keyof TFilter | Partial<TFilter>, value?: any) => {
    setFiltersState((prev) => {
      if (typeof key === "object" && key !== null) {
        return { ...prev, ...key }
      }
      return { ...prev, [key as keyof TFilter]: value }
    })
    setPage(0)
  }, [])

  // Page change handler: accepts 1-based page index (from UI components)
  const onPageChange = useCallback((newPage: number) => {
    setPage(newPage > 0 ? newPage - 1 : 0)
  }, [])

  const resetPagination = useCallback(() => {
    setSearchState(initialSearch)
    setFiltersState(initialFilters)
    setPage(0)
  }, [initialSearch, initialFilters])

  // Computed API query parameters (limit & offset)
  const queryParams = useMemo(() => {
    return {
      limit: pageSize,
      offset: page * pageSize,
      search: search.trim() || undefined,
      ...filters,
    }
  }, [pageSize, page, search, filters])

  // Computed properties ready to pass into DataTable / PaginationComponent
  const paginationProps = useMemo(() => {
    return (totalItems: number = 0) => ({
      page: page + 1, // 1-based page for DataTable
      currentPage: page + 1, // 1-based page for PaginationComponent
      pageSize,
      totalItems,
      onPageChange,
      onPageSizeChange: setPageSize,
      enablePagination: true,
      manualPagination: true,
    })
  }, [page, pageSize, onPageChange, setPageSize])

  return {
    page, // 0-indexed page
    uiPage: page + 1, // 1-indexed page for UI components
    pageSize,
    search,
    filters,

    // Setters
    setPage,
    setPageSize,
    setSearch,
    setFilters,
    onPageChange,
    resetPagination,

    // Query parameters formatted for API calls
    queryParams,

    // Helper function for DataTable/Pagination props
    paginationProps,
  }
}

import { useCallback } from "react"
import { formatDate, formatDateTime, formatDateShort } from "@/lib/utils"

export type DateFormatOptions = {
  format?: "short" | "full" | "dateTime"
  fallback?: string
}

export function useDateFormat() {
  const formatValue = useCallback(
    (date?: string | number | Date | null, options: DateFormatOptions = {}) => {
      const fallback = options.fallback ?? "—"
      if (!date) return fallback

      if (options.format === "short") {
        return formatDateShort(date, fallback)
      }

      if (options.format === "dateTime" || options.format === "full") {
        return formatDateTime(date, fallback)
      }

      return formatDate(date, fallback)
    },
    []
  )

  const formatDateValue = useCallback(
    (date?: string | number | Date | null, fallback = "—") => {
      return formatDate(date, fallback)
    },
    []
  )

  const formatDateShortValue = useCallback(
    (date?: string | number | Date | null, fallback = "—") => {
      return formatDateShort(date, fallback)
    },
    []
  )

  const formatDateTimeValue = useCallback(
    (date?: string | number | Date | null, fallback = "—") => {
      return formatDateTime(date, fallback)
    },
    []
  )

  return {
    formatDate: formatDateValue,
    formatDateShort: formatDateShortValue,
    formatDateTime: formatDateTimeValue,
    format: formatValue,
  }
}

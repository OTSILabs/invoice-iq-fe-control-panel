import { toast as sonnerToast } from "sonner"

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const getString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!isRecord(error)) return fallback

  const response = error.response
  const data = isRecord(response) ? response.data : undefined
  const detail = isRecord(data) ? data.detail : undefined

  return (
    (isRecord(data) ? getString(data.message) : undefined) ||
    getString(detail) ||
    getString(error.message) ||
    fallback
  )
}

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description })
  },
  error: (error: unknown, fallback: string, description?: string) => {
    const message = typeof error === "string" ? error : getErrorMessage(error, fallback)
    sonnerToast.error(message, { description })
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description })
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description })
  }
}

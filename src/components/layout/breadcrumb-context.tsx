import { createContext, use, useState, useMemo } from "react"
import type { ReactNode } from "react"

export interface BreadcrumbItem {
  title: string
  url?: string
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  const contextValue = useMemo(() => ({ breadcrumbs, setBreadcrumbs }), [breadcrumbs])

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  const context = use(BreadcrumbContext)
  if (!context) throw new Error("useBreadcrumb must be used within a BreadcrumbProvider")
  return context
}
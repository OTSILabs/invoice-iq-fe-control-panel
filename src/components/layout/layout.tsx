import { useEffect, Suspense } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

import { AppSidebar } from "./app-sidebar"
import { AppBreadcrumb } from "./AppBreadcrumb"
import { TopLoader } from "./TopLoader"
import { PageLoader } from "./PageLoader"
import { resolveBreadcrumbs } from "@/components/layout/breadcrumb-utils"

import { clearSession } from "@/lib/auth-store"

import { useDataTypes } from "@/api/hooks/data-types"
import { useValidationRules } from "@/api/hooks/validation-rules"
import { useNormalizationRules } from "@/api/hooks/normalization-rules"
import { useExtractionTemplates } from "@/api/hooks/useExtractionTemplates"
import { useExtractionFields } from "@/api/hooks/useExtractionFields"
import { useDerivedTemplates } from "@/api/hooks/useDerivedTemplates"
import { useReferenceLists } from "@/api/hooks/useReferenceLists"

// ─────────────────────────────────────────────────────────────────────────────
// Root layout — wraps every authenticated page.
//
// Structure:
//   <AppSidebar>      collapsible nav
//   <header>          sticky breadcrumb bar + top loader
//   <main>            page content via <Outlet>
// ─────────────────────────────────────────────────────────────────────────────

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  // ── Warm up TanStack Query cache ──────────────────────────────────────────
  useDataTypes()
  useValidationRules()
  useNormalizationRules()
  useExtractionTemplates()
  useExtractionFields()
  useDerivedTemplates()
  useReferenceLists()

  // ── Auth logout listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handleLogout = () => {
      clearSession()
      sessionStorage.clear()
      navigate("/login", { replace: true })
    }
    window.addEventListener("auth:logout", handleLogout)
    return () => window.removeEventListener("auth:logout", handleLogout)
  }, [navigate])

  // ── Breadcrumbs ───────────────────────────────────────────────────────────
  const breadcrumbs = resolveBreadcrumbs(location.pathname)

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        closeButton
        position="bottom-right"
        duration={5000}
        visibleToasts={5}
        expand
        toastOptions={{
          classNames: {
            description: "text-muted-foreground!",
            closeButton: "hover:bg-primary! hover:text-primary-foreground!",
          },
        }}
      />

      {/* In-flight fetch indicator */}
      <TopLoader />

      <TooltipProvider>
        <SidebarProvider>

          {/* ── Sidebar ── */}
          <AppSidebar />

          <SidebarInset className="bg-background flex h-svh flex-col overflow-hidden">

            {/* ── Header ── */}
            <header className="sticky top-0 z-10 flex min-h-14 shrink-0 items-center border-b border-border/45 bg-header/80 px-4 py-3 text-header-foreground backdrop-blur-xl sm:px-6">
              <AppBreadcrumb breadcrumbs={breadcrumbs} />
            </header>

            {/* ── Page content ── */}
            <main className="flex-1 overflow-auto bg-background">
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </main>

          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </>
  )
}

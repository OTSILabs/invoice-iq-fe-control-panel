import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

import { AppSidebar } from "./app-sidebar"
import { AppBreadcrumb } from "./AppBreadcrumb"
import { TopLoader } from "./TopLoader"
import { resolveBreadcrumbs } from "@/components/layout/breadcrumb-utils"
import { PoweredByFooter } from "@/components/poweredby"

import { clearSession } from "@/lib/auth-store"

// ─────────────────────────────────────────────────────────────────────────────
// Root layout — wraps every authenticated page.
//
// Structure:
//   <AppSidebar>      collapsible nav
//   <header>          sticky breadcrumb bar + top loader
//   <main>            page content via <Outlet>
//   <footer>          branding strip
// ─────────────────────────────────────────────────────────────────────────────

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
  const breadcrumbs = resolveBreadcrumbs(location.pathname, queryClient)

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

          <SidebarInset className="bg-background flex flex-col h-svh overflow-hidden">

            {/* ── Header ── */}
            <header className="min-h-16 shrink-0 sticky top-0 z-10 flex items-center px-4 sm:px-6 py-3 bg-header/80 backdrop-blur-md text-header-foreground border-b border-border">
              <AppBreadcrumb breadcrumbs={breadcrumbs} />
            </header>

            {/* ── Page content ── */}
            <main className="flex-1 p-2 sm:p-4 lg:p-8 overflow-auto bg-background">
              <Outlet />
            </main>

            {/* ── Footer ── */}
            <PoweredByFooter className="h-10 border-t border-border bg-footer text-footer-foreground" />

          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </>
  )
}

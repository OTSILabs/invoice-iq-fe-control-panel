
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { APP_ROUTES } from "@/config/routes"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { organizationsService } from "@/api/services/organizations.service"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "./app-sidebar"
import { Fragment, useEffect } from "react"

function OrganizationBreadcrumbName({ id, fallback }: { id: string, fallback: string }) {
  const { data } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationsService.getById(id),
    staleTime: 1000 * 60 * 5, // Keep it fresh for 5 mins
  })
  
  return <>{data?.name || fallback}</>
}

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

useEffect(() => {
    const handleLogout = () => {
      sessionStorage.clear()
      navigate("/login", { replace: true })
    }
    window.addEventListener("auth:logout", handleLogout)
    return () => window.removeEventListener("auth:logout", handleLogout)
  }, [navigate])

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean)
    const breadcrumbs = []
    let currentPath = ""

    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`
      const routeMatch = APP_ROUTES.find((r) => r.path === currentPath)
      
      let title = ""
      if (routeMatch) {
        title = routeMatch.title === "Manage Teams" ? "Team Members" : routeMatch.title
      } else {
        title = paths[i].charAt(0).toUpperCase() + paths[i].slice(1)
        
        // If it's a dynamic ID under organizations
        if (i > 0 && paths[i - 1] === "organizations") {
          const orgId = paths[i]
          const cachedOrg: any = queryClient.getQueryData(['organizations', orgId])
          if (cachedOrg && cachedOrg.name) {
            title = cachedOrg.name
          } else {
            title = `DYNAMIC_ORG_${orgId}`
          }
        } 
        // Fallback for other long IDs
        else if (title.length > 20 || /^[0-9a-fA-F-]{36}$/.test(title)) {
          title = "View"
        }
      }

      breadcrumbs.push({
        title,
        href: currentPath,
        isLast: i === paths.length - 1
      })
    }
    
    // Fallback if empty (e.g., at "/")
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ title: "Home", href: "/", isLast: true })
    }
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <>
      <Toaster position="top-right" />

      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-background flex flex-col h-svh overflow-hidden">

            {/* ── Header ── */}
            <header className="min-h-16 shrink-0 flex items-center px-4 sm:px-6 py-3 bg-header/80 backdrop-blur-md text-header-foreground border-b border-border z-10 sticky top-0">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb) => (
                    <Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>
                            {crumb.title.startsWith("DYNAMIC_ORG_") ? (
                               <OrganizationBreadcrumbName id={crumb.title.replace("DYNAMIC_ORG_", "")} fallback="Loading..." />
                            ) : (
                              crumb.title
                            )}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href}>
                              {crumb.title.startsWith("DYNAMIC_ORG_") ? (
                                <OrganizationBreadcrumbName id={crumb.title.replace("DYNAMIC_ORG_", "")} fallback="Loading..." />
                              ) : (
                                crumb.title
                              )}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!crumb.isLast && <BreadcrumbSeparator />}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* ── Content ── */}
            <main className="flex-1 p-2 sm:p-4 lg:p-8 overflow-auto bg-background">
              <Outlet />
            </main>

            {/* ── Footer ── */}
            <footer className="h-10 shrink-0 border-t border-border bg-footer text-footer-foreground flex items-center justify-center gap-1.5 text-[11px] tracking-tight mt-auto">
              Powered by{" "}
              <strong className="text-primary font-bold text-[11px]">OTSI</strong>
              <span className="text-border mx-0.5">|</span>
              Copyright © 2026 Object Technology Solutions, Inc. All rights reserved.
            </footer>

          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </>
  )
}
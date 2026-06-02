import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./app-sidebar"
import { APP_ROUTES } from "@/config/routes"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

export function Layout() {
  const location = useLocation()
  
  // Find the current route from our central config
  const currentRoute = APP_ROUTES.find(route => route.path === location.pathname) || APP_ROUTES[0]

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-slate-700">
                    {currentRoute.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex-1 p-6 bg-slate-50/50">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  )
}

// import React from "react"
// import { Outlet, useLocation, useNavigate } from "react-router-dom"
// import { useEffect } from "react"
// import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
// import { TooltipProvider } from "@/components/ui/tooltip"
// import { AppSidebar } from "./app-sidebar"
// import { APP_ROUTES } from "@/config/routes"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbList,
//   BreadcrumbPage,
// } from "@/components/ui/breadcrumb"
// import { Separator } from "@/components/ui/separator"

// export function Layout() {
//   const location = useLocation()
//   const navigate = useNavigate()
  
//   React.useEffect(() => {
//     const handleLogout = () => {
//       sessionStorage.clear(); // Ensure it's cleared globally on any logout event
//       navigate('/login', { replace: true });
//     };
//     window.addEventListener('auth:logout', handleLogout);
//     return () => window.removeEventListener('auth:logout', handleLogout);
//   }, [navigate]);
  
//   // Find the current route to display the correct breadcrumb
//   const currentRoute = APP_ROUTES.find(route => route.path === location.pathname) || { title: "Page Not Found" }

//   return (
//     <TooltipProvider>
//       <SidebarProvider>
//         <AppSidebar />
//         <SidebarInset className="bg-slate-50 min-h-screen flex flex-col">
//           <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 px-6 bg-white z-10 sticky top-0">
//             <SidebarTrigger className="-ml-2 md:hidden" />
//             <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
//             <Breadcrumb>
//               <BreadcrumbList>
//                 <BreadcrumbItem>
//                   <span className="text-slate-500 font-medium text-sm">Home</span>
//                 </BreadcrumbItem>
//                 <span className="text-slate-300 mx-1.5 text-sm">{'>'}</span>
//                 <BreadcrumbItem>
//                   <BreadcrumbPage className="font-semibold text-slate-800 text-sm">
//                     {currentRoute.title === "Manage Teams" ? "Team Members" : currentRoute.title}
//                   </BreadcrumbPage>
//                 </BreadcrumbItem>
//               </BreadcrumbList>
//             </Breadcrumb>
//           </header>
          
//           <div className="flex-1 p-6 overflow-hidden flex flex-col h-[calc(100vh-100px)]">
//             <Outlet />
//           </div>

//           <footer className="py-3 border-t border-slate-200 text-center text-[11px] text-slate-500 bg-white flex items-center justify-center gap-1.5 shrink-0 mt-auto">
//             Powered by <strong className="text-blue-700 tracking-tight font-bold text-[12px]">OTSI</strong> <span className="text-slate-300">|</span> Copyright © 2026 Object Technology Solutions, Inc. All rights reserved.
//           </footer>
//         </SidebarInset>
//       </SidebarProvider>
//     </TooltipProvider>
//   )
// }

import React from "react"
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./app-sidebar"
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

  React.useEffect(() => {
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
      {/* Google Font — loaded once here, applies everywhere */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .outlet-card {
          animation: fadeUp 0.2s ease both;
        }

        /* Subtle scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      
      <Toaster position="top-right" />

      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-[#f4f6fa] flex flex-col h-svh overflow-hidden">

            {/* ── Header ── */}
            <header className="min-h-16 shrink-0 flex items-center px-4 sm:px-6 py-3 bg-white border-b border-slate-100/80 z-10">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage className="text-slate-800 font-semibold text-[15px]">
                            {crumb.title.startsWith("DYNAMIC_ORG_") ? (
                              <OrganizationBreadcrumbName id={crumb.title.replace("DYNAMIC_ORG_", "")} fallback="Loading..." />
                            ) : (
                              crumb.title
                            )}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href} className="text-slate-500 font-medium text-sm hover:text-slate-800">
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
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* ── Content ── */}
            <main className="flex-1 px-5 pt-4 pb-5 overflow-auto bg-white">
              <Outlet />
            </main>

            {/* ── Footer ── */}
            <footer className="h-10 shrink-0 border-t border-slate-100 bg-white flex items-center justify-center gap-1.5 text-[11px] text-slate-400 tracking-tight mt-auto">
              Powered by{" "}
              <strong className="text-blue-600 font-bold text-[11px]">OTSI</strong>
              <span className="text-slate-200 mx-0.5">|</span>
              Copyright © 2026 Object Technology Solutions, Inc. All rights reserved.
            </footer>

          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </>
  )
}
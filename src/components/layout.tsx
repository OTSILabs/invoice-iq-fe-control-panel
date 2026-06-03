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
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./app-sidebar"
import { APP_ROUTES } from "@/config/routes"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  React.useEffect(() => {
    const handleLogout = () => {
      sessionStorage.clear()
      navigate("/login", { replace: true })
    }
    window.addEventListener("auth:logout", handleLogout)
    return () => window.removeEventListener("auth:logout", handleLogout)
  }, [navigate])

  const currentRoute = APP_ROUTES.find((r) => r.path === location.pathname) || { title: "Page Not Found" }
  const pageTitle = currentRoute.title === "Manage Teams" ? "Team Members" : currentRoute.title

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

      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-[#f4f6fa] flex flex-col min-h-svh">

            {/* ── Header ── */}
            <header className="h-14 shrink-0 flex items-center px-6 bg-white border-b border-slate-100/80 sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-slate-800 font-semibold text-[13px] tracking-tight">
                      {pageTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            {/* ── Content ── */}
           {/* ── Content ── */}
{/* ── Content ── */}
<main className="flex-1 px-5 pt-4 pb-5 overflow-auto" style={{ height: "calc(100vh - 96px)" }}>
 
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
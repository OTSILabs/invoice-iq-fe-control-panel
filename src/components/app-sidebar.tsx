import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { FileCheck2, ChevronUp, User2, LogOut } from "lucide-react"

import { TeamSwitcher } from "@/components/team-switcher"
import { decodeJWT } from "@/lib/utils"
import { APP_ROUTES } from "@/config/routes"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  // Format teams for TeamSwitcher
  const teams = [
    {
      name: "Invoice IQ",
      logo: FileCheck2,
      plan: "Enterprise",
    }
  ]

  // Get and decode the user's token
  const tokenData = React.useMemo(() => {
    try {
      const stored = sessionStorage.getItem("token");
      if (stored) {
        const session = JSON.parse(stored);
        const actualToken = session.access_token || session.token;
        if (actualToken) {
          return decodeJWT(actualToken);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, []);

  const userName = tokenData?.name || tokenData?.username || tokenData?.email?.split('@')[0] || "User";
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userRole = tokenData?.role || tokenData?.app_metadata?.role || "User";

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-center p-0">
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu className="mt-4 px-2">
          {APP_ROUTES.filter((route) => route.showInSidebar).map((route) => {
            const isActive = location.pathname.startsWith(route.path);
            return (
              <SidebarMenuItem key={route.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={route.title} 
                  isActive={isActive}
                  className={isActive ? "!bg-blue-50 !text-blue-700 font-semibold hover:!bg-blue-100 hover:!text-blue-800" : "text-slate-600"}
                >
                  <Link to={route.path}>
                    <route.icon className="h-4 w-4" />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold text-xs">
                    {userInitials}
                  </div>
                  <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden overflow-hidden flex-1 text-left ml-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate w-full">{userName}</span>
                    <span className="text-xs text-slate-500 truncate w-full">{userRole}</span>
                  </div>
                  <ChevronUp className="h-4 w-4 ml-auto shrink-0 group-data-[collapsible=icon]:hidden opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <User2 className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  sessionStorage.clear();
                  window.dispatchEvent(new Event('auth:logout'));
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}

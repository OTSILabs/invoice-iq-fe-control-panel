import * as React from "react"
import { Link } from "react-router-dom"
import { FileCheck2, ChevronUp, User2, LogOut } from "lucide-react"

import { TeamSwitcher } from "@/components/team-switcher"
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
  // Format teams for TeamSwitcher
  const teams = [
    {
      name: "Invoice IQ",
      logo: FileCheck2,
      plan: "Enterprise",
    }
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-center p-0">
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu className="mt-4 px-2">
          {APP_ROUTES.map((route) => (
            <SidebarMenuItem key={route.title}>
              <SidebarMenuButton asChild tooltip={route.title}>
                <Link to={route.path}>
                  <route.icon className="h-4 w-4" />
                  <span>{route.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold text-xs">
                    BH
                  </div>
                  <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden overflow-hidden flex-1 text-left ml-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate w-full">Bhushan</span>
                    <span className="text-xs text-slate-500 truncate w-full">Admin</span>
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
                  window.location.href = "/login"
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

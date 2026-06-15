import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { FileCheck2, ChevronUp, User2, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { getDecodedToken } from "@/lib/utils"
import { APP_ROUTES } from "@/config/routes"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// ── Logo + collapse trigger ──────────────────────────────────────────────────
function SidebarLogoHeader() {
  const { toggleSidebar, open, isMobile } = useSidebar()
  const [hovered, setHovered] = React.useState(false)
  const isCollapsed = !open && !isMobile

  return (
    <button
      type="button"
      className={cn(
        "relative flex h-16 w-full items-center border-b border-sidebar-border cursor-pointer select-none transition-all duration-200 text-left bg-transparent p-0 border-t-0 border-x-0 outline-none",
        isCollapsed ? "justify-center" : "px-4"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={toggleSidebar}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
    >
      {/* App icon — disappears on hover when collapsed */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-opacity duration-200",
          !open && !isMobile && hovered ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <FileCheck2 className="h-4 w-4" />
      </div>

      {/* App name — visible when expanded */}
      <span
        className={cn(
          "text-sm font-semibold text-sidebar-foreground tracking-tight transition-all duration-200 overflow-hidden whitespace-nowrap",
          open && !isMobile ? "ml-3 opacity-100 max-w-[120px]" : "ml-0 opacity-0 max-w-0"
        )}
      >
        Invoice IQ
      </span>

      <div
        className={cn(
          "absolute flex items-center justify-center rounded-md p-1 text-sidebar-foreground/50 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          open && !isMobile
            ? "right-4 opacity-100"
            : cn(
                "left-1/2 -translate-x-1/2",
                hovered ? "opacity-100" : "opacity-0 pointer-events-none"
              )
        )}
      >
        {open && !isMobile ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
      </div>
    </button>
  )
}

// ── Main sidebar ─────────────────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { open, isMobile } = useSidebar()
  const isCollapsed = !open && !isMobile

  const tokenData = React.useMemo(() => getDecodedToken(), [])

  const userName =
    tokenData?.name ||
    tokenData?.username ||
    tokenData?.email?.split("@")[0] ||
    "User"
  const userInitials = userName.substring(0, 2).toUpperCase()
  const userRole = tokenData?.role || tokenData?.app_metadata?.role || "User"

  const visibleRoutes = APP_ROUTES.filter((r) => r.showInSidebar)

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>

      {/* ── Header with logo + collapse trigger ── */}
      <SidebarHeader className="p-0">
        <SidebarLogoHeader />
      </SidebarHeader>

      {/* ── Nav items ── */}
      <SidebarContent className="py-3">
        <SidebarMenu className="px-2 gap-0.5">
          {visibleRoutes.map((route) => {
            const isActive = location.pathname.startsWith(route.path)
            const Icon = route.icon

            const button = (
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={cn(
                  "h-9 rounded-lg text-sm font-medium transition-all duration-200 data-active:bg-blue-50! data-active:text-blue-700! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!",
                  isActive
                    ? "hover:bg-blue-100 hover:text-blue-800 border-l-2 border-blue-600 rounded-r-lg rounded-l-none pl-2.5"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg"
                )}
              >
                <Link to={route.path} className="flex items-center gap-2">
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 ",
                        isActive ? "text-blue-600" : "text-slate-500",
                        //  open && !isMobile ? "ml-1" : "ml-3"
                        
                      )}
                    />
                  )}
                  <span className="truncate group-data-[collapsible=icon]:hidden">{route.title}</span>
                </Link>
              </SidebarMenuButton>
            )

            return (
              <SidebarMenuItem key={route.title}>
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger className="ml-1" asChild>{button}</TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      {route.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="ml-1.5">{button}</div>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ── Footer: user menu ── */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-10 rounded-lg ml-1.5  hover:bg-slate-100 data-[state=open]:bg-slate-100 group-data-[collapsible=icon]:justify-center"
                >
                  {/* Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-xs font-semibold group-data-[collapsible=icon]:mx-auto">
                    {userInitials}
                  </div>

                  {/* Name + role — hidden when collapsed */}
                  <div className="flex flex-col items-start leading-tight overflow-hidden flex-1 ml-1 group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-slate-700 truncate w-full ">
                      {userName}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate w-full">
                      {userRole}
                    </span>
                  </div>

                  <ChevronUp className="h-3.5 w-3.5 ml-auto shrink-0 text-slate-400 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] text-xs-fine">
                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                  <Link to="/profile" className="flex w-full items-center gap-2">
                    <User2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={() => {
                    sessionStorage.clear()
                    window.dispatchEvent(new Event("auth:logout"))
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
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
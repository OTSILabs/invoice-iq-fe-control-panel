import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { FileCheck2, ChevronUp, ChevronDown, ChevronRight, User2, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react"
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
        "relative flex h-16 w-full cursor-pointer select-none items-center border-b border-sidebar-border/60 bg-transparent p-0 text-left outline-none transition-all duration-200",
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
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-opacity duration-200",
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
  const { toggleSidebar, open, isMobile } = useSidebar()
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

  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    APP_ROUTES.forEach((r) => {
      if (r.children && location.pathname.startsWith(r.path)) {
        initial[r.title] = true
      }
    })
    return initial
  })

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/55 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--sidebar)_96%,white)_0%,var(--sidebar)_45%,color-mix(in_oklch,var(--sidebar)_94%,var(--background))_100%)]"
      {...props}
    >

      {/* ── Header with logo + collapse trigger ── */}
      <SidebarHeader className="p-0">
        <SidebarLogoHeader />
      </SidebarHeader>

      {/* ── Nav items ── */}
      <SidebarContent className="py-3">
        <SidebarMenu className="px-2 gap-0.5">
          {visibleRoutes.map((route) => {
            const Icon = route.icon

            if (route.children) {
              const isMenuExpanded = !!expandedMenus[route.title]
              const hasActiveChild = route.children.some((child) => location.pathname === child.path)

              const parentButton = (
                <SidebarMenuButton
                  onClick={() => {
                    if (isCollapsed) {
                      toggleSidebar()
                      setExpandedMenus((prev) => ({ ...prev, [route.title]: true }))
                    } else {
                      toggleMenu(route.title)
                    }
                  }}
                  className={cn(
                    "h-9 w-full cursor-pointer justify-between rounded-lg text-sm font-medium transition-all duration-200",
                    hasActiveChild && !isCollapsed
                      ? "bg-background/85 text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border/70"
                      : "text-sidebar-foreground/72 hover:bg-background/55 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          hasActiveChild ? "text-sidebar-primary" : "text-sidebar-foreground/65"
                        )}
                      />
                    )}
                    <span className="truncate group-data-[collapsible=icon]:hidden">{route.title}</span>
                  </div>
                  {!isCollapsed && (
                    isMenuExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/55" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-sidebar-foreground/55" />
                    )
                  )}
                </SidebarMenuButton>
              )

              return (
                <SidebarMenuItem key={route.title} className="flex flex-col">
                  {isCollapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger className="ml-1" asChild>{parentButton}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        {route.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="ml-1.5">{parentButton}</div>
                  )}

                   {!isCollapsed && isMenuExpanded && (
                    <div className="ml-6 mt-1 flex animate-in flex-col gap-0.5 border-l border-sidebar-border/55 pl-2 duration-200 slide-in-from-top-1">
                      {route.children.map((child) => {
                        const isChildActive = location.pathname === child.path
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                              "h-9 flex items-center text-sm font-medium transition-all duration-200 w-full gap-2",
                              isChildActive
                                ? "rounded-lg bg-background/85 text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border/70"
                                : "rounded-lg pl-3 text-sidebar-foreground/70 hover:bg-background/55 hover:text-sidebar-accent-foreground"
                            )}
                          >
                            {ChildIcon && (
                              <ChildIcon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  isChildActive ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                                )}
                              />
                            )}
                            <span>{child.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </SidebarMenuItem>
              )
            }

            const isActive = location.pathname.startsWith(route.path)
            const button = (
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={cn(
                  "h-9 rounded-lg text-sm font-medium transition-all duration-200 data-active:bg-sidebar-accent! data-active:text-sidebar-accent-foreground! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!",
                  isActive
                    ? "bg-background/85 text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border/70"
                    : "rounded-lg text-sidebar-foreground/72 hover:bg-background/55 hover:text-sidebar-accent-foreground"
                )}
              >
                <Link to={route.path || "#"} className="flex items-center gap-2">
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 ",
                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/65"
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
      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="ml-1.5 h-10 rounded-lg hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:justify-center"
                >
                  {/* Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/12 text-sidebar-primary text-xs font-semibold group-data-[collapsible=icon]:mx-auto">
                    {userInitials}
                  </div>

                  {/* Name + role — hidden when collapsed */}
                  <div className="flex flex-col items-start leading-tight overflow-hidden flex-1 ml-1 group-data-[collapsible=icon]:hidden">
                    <span className="w-full truncate text-sm font-medium text-sidebar-foreground">
                      {userName}
                    </span>
                    <span className="w-full truncate text-[11px] text-sidebar-foreground/60">
                      {userRole}
                    </span>
                  </div>

                  <ChevronUp className="ml-auto h-3.5 w-3.5 shrink-0 text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] text-xs-fine">
                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                  <Link to="/profile" className="flex w-full items-center gap-2">
                    <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
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

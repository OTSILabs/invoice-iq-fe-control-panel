import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  FileCheck2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  User2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { getDecodedToken } from "@/lib/utils"
import { SidebarCreateButton } from "../../pages/side-bar-create/side-bar-create"
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
import { PoweredByFooter } from "@/components/poweredby"

// ── Logo + collapse trigger ──────────────────────────────────────────────────
function SidebarLogoHeader() {
  const { toggleSidebar, open, isMobile } = useSidebar()
  const [hovered, setHovered] = React.useState(false)
  const isCollapsed = !open && !isMobile

  return (
    <button
      type="button"
      className={cn(
        "relative flex h-14 w-full cursor-pointer items-center border-b border-sidebar-border/60 bg-transparent p-0 text-left transition-all duration-200 outline-none select-none",
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
          !open && !isMobile && hovered
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        )}
      >
        <FileCheck2 className="h-4 w-4" />
      </div>

      {/* App name — visible when expanded */}
      <span
        className={cn(
          "overflow-hidden text-sm font-semibold tracking-tight whitespace-nowrap text-sidebar-foreground transition-all duration-200",
          open && !isMobile
            ? "ml-3 max-w-[120px] opacity-100"
            : "ml-0 max-w-0 opacity-0"
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
                hovered ? "opacity-100" : "pointer-events-none opacity-0"
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

  const [expandedMenus, setExpandedMenus] = React.useState<
    Record<string, boolean>
  >(() => {
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
      className="border-r border-sidebar-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--sidebar)_92%,white)_0%,var(--sidebar)_44%,color-mix(in_oklch,var(--sidebar)_88%,black)_100%)]"
      {...props}
    >
      {/* ── Header with logo + collapse trigger ── */}
      <SidebarHeader className="p-0">
        <SidebarLogoHeader />
      </SidebarHeader>

      {/* ── Nav items ── */}
      <SidebarContent className="py-3">
        <div className="mb-3 flex justify-start px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <SidebarCreateButton />
        </div>
        <SidebarMenu className="gap-0.5 px-2">
          {visibleRoutes.map((route) => {
            const Icon = route.icon

            if (route.children) {
              const isMenuExpanded = !!expandedMenus[route.title]
              const hasActiveChild = route.children.some((child) =>
                location.pathname.startsWith(child.path)
              )

              const parentButton = (
                <SidebarMenuButton
                  onClick={() => {
                    if (isCollapsed) {
                      toggleSidebar()
                      setExpandedMenus((prev) => ({
                        ...prev,
                        [route.title]: true,
                      }))
                    } else {
                      toggleMenu(route.title)
                    }
                  }}
                  className={cn(
                    "h-9 w-full cursor-pointer justify-between rounded-lg text-sm font-medium transition-all duration-200",
                    hasActiveChild && !isCollapsed
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border"
                      : "text-sidebar-foreground/72 hover:bg-sidebar-accent/65 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          hasActiveChild
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/65"
                        )}
                      />
                    )}
                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      {route.title}
                    </span>
                  </div>
                  {!isCollapsed &&
                    (isMenuExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/55" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-sidebar-foreground/55" />
                    ))}
                </SidebarMenuButton>
              )

              return (
                <SidebarMenuItem key={route.title} className="flex flex-col">
                  {isCollapsed ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>{parentButton}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="text-xs font-medium"
                      >
                        {route.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="ml-1.5">{parentButton}</div>
                  )}

                  {!isCollapsed && isMenuExpanded && (
                    <div className="mt-1 ml-3 flex animate-in flex-col gap-0.5 border-l border-sidebar-border/70 pl-2 duration-200 slide-in-from-top-1">
                      {route.children.map((child) => {
                        const isChildActive = location.pathname.startsWith(
                          child.path
                        )
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                              "flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-xs font-medium transition-all duration-200",
                              isChildActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border/80"
                                : "text-sidebar-foreground/68 hover:bg-sidebar-accent/65 hover:text-sidebar-accent-foreground"
                            )}
                            title={child.title}
                          >
                            {ChildIcon && (
                              <ChildIcon
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0",
                                  isChildActive
                                    ? "text-sidebar-primary"
                                    : "text-sidebar-foreground/60"
                                )}
                              />
                            )}
                            <span className="min-w-0 truncate">
                              {child.title}
                            </span>
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
                  "h-9 rounded-lg text-sm font-medium transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! data-active:bg-sidebar-accent! data-active:text-sidebar-accent-foreground!",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border"
                    : "rounded-lg text-sidebar-foreground/72 hover:bg-sidebar-accent/65 hover:text-sidebar-accent-foreground"
                )}
              >
                <Link
                  to={route.path || "#"}
                  className="flex items-center gap-2"
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/65"
                      )}
                    />
                  )}
                  <span className="truncate group-data-[collapsible=icon]:hidden">
                    {route.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            )

            return (
              <SidebarMenuItem key={route.title}>
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="text-xs font-medium"
                    >
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
                  className="ml-1.5 h-10 rounded-lg group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent/65 data-[state=open]:bg-sidebar-accent"
                >
                  {/* Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/12 text-xs font-semibold text-sidebar-primary group-data-[collapsible=icon]:mx-auto">
                    {userInitials}
                  </div>

                  {/* Name + role — hidden when collapsed */}
                  <div className="ml-1 flex flex-1 flex-col items-start overflow-hidden leading-tight group-data-[collapsible=icon]:hidden">
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

              <DropdownMenuContent
                side="top"
                className="text-xs-fine w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild className="cursor-pointer gap-2">
                  <Link
                    to="/profile"
                    className="flex w-full items-center gap-2"
                  >
                    <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
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
        <PoweredByFooter
          variant="sidebar"
          className="mx-1.5 mt-1 group-data-[collapsible=icon]:hidden"
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

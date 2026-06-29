import * as React from "react"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Plus,
  Building2,
  CreditCard,
  Users,
  Database,
  Tags,
  ListChecks,
  ShieldCheck,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"

const createOptions = [
  {
    group: "Core Management",
    items: [
      {
        label: "Organization",
        path: "/organizations/create",
        icon: Building2,
      },
      { label: "Billing Plan", path: "/plan/create", icon: CreditCard },
      { label: "User Account", path: "/users/create", icon: Users },
      { label: "ERP Setting", path: "/erp-settings/create", icon: Database },
    ],
  },
  {
    group: "Platform Content",
    items: [
      {
        label: "Data Type",
        path: "/platform-standard-content/data-types/create",
        icon: Database,
      },
      {
        label: "Field Category",
        path: "/platform-standard-content/field-categories/create",
        icon: Tags,
      },
      {
        label: "Reference List",
        path: "/platform-standard-content/reference-lists/create",
        icon: ListChecks,
      },
      {
        label: "Validation Rule",
        path: "/platform-standard-content/validation-rules/create",
        icon: ShieldCheck,
      },
      {
        label: "Normalization Rule",
        path: "/platform-standard-content/normalization-rules/create",
        icon: RefreshCw,
      },
    ],
  },
  {
    group: "Extraction Management",
    items: [
      {
        label: "Base Template",
        path: "/platform-standard-content/extraction-management/templates/new",
        icon: FileText,
      },
      {
        label: "Derived Template",
        path: "/platform-standard-content/extraction-management/derived/new",
        icon: FileText,
      },
      {
        label: "Extraction Field",
        path: "/platform-standard-content/extraction-management/fields/create",
        icon: FileText,
      },
    ],
  },
]

export function SidebarCreateButton() {
  const { open, isMobile } = useSidebar()
  const isCollapsed = !open && !isMobile
  const [isOpen, setIsOpen] = React.useState(false)

  const triggerButton = isCollapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-all duration-200 hover:bg-sidebar-primary/90"
          >
            <Plus className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs font-semibold">
        Create New...
      </TooltipContent>
    </Tooltip>
  ) : (
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="flex h-9 w-full cursor-pointer items-center justify-between rounded-lg bg-sidebar-primary px-3 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all duration-200 hover:bg-sidebar-primary/90"
      >
        <div className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Create New</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 opacity-70" />
        )}
      </button>
    </DropdownMenuTrigger>
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {triggerButton}
      <DropdownMenuContent
        side={isCollapsed ? "right" : "bottom"}
        align={isCollapsed ? "start" : "center"}
        className="max-h-[80vh] w-56 scrollbar-none overflow-y-auto p-1.5"
      >
        {createOptions.map((group, gIdx) => (
          <React.Fragment key={group.group}>
            {gIdx > 0 && <div className="my-1 border-t border-border/40" />}
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
              {group.group}
            </div>
            {group.items.map((item) => {
              const ItemIcon = item.icon
              return (
                <DropdownMenuItem
                  key={item.label}
                  asChild
                  className="cursor-pointer gap-2 rounded-md py-1.5 text-xs hover:bg-accent focus:bg-accent"
                >
                  <Link to={item.path}>
                    <ItemIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

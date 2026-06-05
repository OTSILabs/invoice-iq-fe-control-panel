import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: any
    plan: string
  }[]
}) {
  const activeTeam = teams[0]

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default w-full justify-center group-data-[collapsible=icon]:justify-center">
          <div className="flex shrink-0 aspect-square size-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <activeTeam.logo className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold text-lg tracking-tight text-slate-800 dark:text-slate-100">{activeTeam.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

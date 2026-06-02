import { LayoutDashboard, Users as UsersIcon } from "lucide-react"

import { Dashboard } from "@/pages/dashboard"
import { Users } from "@/pages/users"

export const APP_ROUTES = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    component: Dashboard,
  },
  {
    path: "/users",
    title: "Users",
    icon: UsersIcon,
    component: Users,
  }
]

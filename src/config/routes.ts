import { LayoutDashboard, Building2, CreditCard } from "lucide-react"

import { Dashboard } from "@/pages/dashboard"
import { Organizations } from "@/pages/organization/organizations"
import { Plans } from "@/pages/plans"
import { CreatePlan } from "@/pages/create-plan"


export type AppRoute = {
  path: string;
  title: string;
  icon: any;
  component: any;
  showInSidebar?: boolean;
}

export const APP_ROUTES: AppRoute[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    component: Dashboard,
    showInSidebar: true,
  },
  {
    path: "/organizations",
    title: "Organizations",
    icon: Building2,
    component: Organizations,
    showInSidebar: true,
  },
  {
    path: "/plan",
    title: "Plan",
    icon: CreditCard,
    component: Plans,
    showInSidebar: true,
  },
  {
    path: "/plan/create",
    title: "Create Plan",
    icon: CreditCard,
    component: CreatePlan,
    showInSidebar: false,
  }
]

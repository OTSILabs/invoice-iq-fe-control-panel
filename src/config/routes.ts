import type { ComponentType } from "react"
import {  Building2, CreditCard, Database, Users as UsersIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Organizations } from "@/pages/organization/organizations"
import { Plans } from "@/pages/plans/plans"
import { Users } from "@/pages/user/users"
import { ErpSettings } from "@/pages/erp-setting/erp-setting"
import { CreatePlan } from "@/pages/plans/create-plan"

export type AppRoute = {
  path: string;
  title: string;
  icon: LucideIcon;
  component: ComponentType;
  showInSidebar?: boolean;
}

export const APP_ROUTES: AppRoute[] = [
 
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
    path: "/users",
    title: "Users",
    icon: UsersIcon,
    component: Users,
    showInSidebar: true,
  },
   {
    path: "/erp-settings",
    title: "ERP Settings",
    icon: Database,
    component: ErpSettings,
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

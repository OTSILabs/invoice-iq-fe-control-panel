import {  Building2, CreditCard, Users as UsersIcon } from "lucide-react"
import { Organizations } from "@/pages/organization/organizations"
import { Plans } from "@/pages/plans"
import { CreatePlan } from "@/pages/create-plan"
import { Users } from "@/pages/users"

export type AppRoute = {
  path: string;
  title: string;
  icon: any;
  component: any;
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
    path: "/plan/create",
    title: "Create Plan",
    icon: CreditCard,
    component: CreatePlan,
    showInSidebar: false,
  }
]

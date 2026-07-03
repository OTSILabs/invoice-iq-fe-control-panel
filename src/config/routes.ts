import React, { type ComponentType } from "react"
import {
  Building2,
  CreditCard,
  Database,
  Users as UsersIcon,
  Layers,
  Tags,
  ListChecks,
  ShieldCheck,
  RefreshCw,
  FileText,
  UserCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const Organizations = React.lazy(() => import("@/pages/organization/organizations").then(m => ({ default: m.Organizations })))
const Plans = React.lazy(() => import("@/pages/plans/plans").then(m => ({ default: m.Plans })))
const Users = React.lazy(() => import("@/pages/user/users").then(m => ({ default: m.Users })))
const ErpSettings = React.lazy(() => import("@/pages/erp-setting/erp-setting").then(m => ({ default: m.ErpSettings })))
const CreatePlan = React.lazy(() => import("@/pages/plans/create-plan").then(m => ({ default: m.CreatePlan })))
const Profile = React.lazy(() => import("@/pages/profile/profile").then(m => ({ default: m.Profile })))

// Import Platform Standard Content pages
const DataTypes = React.lazy(() => import("@/pages/platform-standard-content/data-type/data-types").then(m => ({ default: m.DataTypes })))
const FieldCategories = React.lazy(() => import("@/pages/platform-standard-content/field-categories/field-categories").then(m => ({ default: m.FieldCategories })))
const ReferenceLists = React.lazy(() => import("@/pages/platform-standard-content/reference-lists/reference-lists").then(m => ({ default: m.ReferenceLists })))
const ValidationRules = React.lazy(() => import("@/pages/platform-standard-content/validation rule/validation-rules").then(m => ({ default: m.ValidationRules })))
const NormalizationRules = React.lazy(() => import("@/pages/platform-standard-content/normalization-rule/normalization-rules").then(m => ({ default: m.NormalizationRules })))
const ExtractionManagement = React.lazy(() => import("@/pages/platform-standard-content/extraction-management").then(m => ({ default: m.ExtractionManagement })))
const TenantsPage = React.lazy(() => import("@/pages/tenants/tenants-page").then(m => ({ default: m.TenantsPage })))

export type AppSubRoute = {
  path: string
  title: string
  icon: LucideIcon
  component: ComponentType
}

export type AppRoute = {
  path: string
  title: string
  icon: LucideIcon
  component?: ComponentType
  showInSidebar?: boolean
  children?: AppSubRoute[]
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
    path: "/tenants",
    title: "Tenants",
    icon: UserCheck,
    component: TenantsPage,
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
    path: "/platform-standard-content",
    title: "Platform Content",
    icon: Layers,
    showInSidebar: true,
    children: [
      {
        path: "/platform-standard-content/data-types",
        title: "Data Types",
        icon: Database,
        component: DataTypes,
      },
      {
        path: "/platform-standard-content/field-categories",
        title: "Field Categories",
        icon: Tags,
        component: FieldCategories,
      },
      {
        path: "/platform-standard-content/reference-lists",
        title: "Reference Lists",
        icon: ListChecks,
        component: ReferenceLists,
      },
      {
        path: "/platform-standard-content/validation-rules",
        title: "Validation Rules",
        icon: ShieldCheck,
        component: ValidationRules,
      },
      {
        path: "/platform-standard-content/normalization-rules",
        title: "Normalization Rules",
        icon: RefreshCw,
        component: NormalizationRules,
      },
      {
        path: "/platform-standard-content/extraction-management",
        title: "Extraction Manager",
        icon: FileText,
        component: ExtractionManagement,
      },
    ],
  },
  {
    path: "/plan/create",
    title: "Create Plan",
    icon: CreditCard,
    component: CreatePlan,
    showInSidebar: false,
  },
  {
    path: "/profile",
    title: "My Profile",
    icon: UsersIcon,
    component: Profile,
    showInSidebar: false,
  },
]


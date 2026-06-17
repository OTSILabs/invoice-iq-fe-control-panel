import type { ComponentType } from "react"
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
  FileCheck,
  LayoutTemplate
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Organizations } from "@/pages/organization/organizations"
import { Plans } from "@/pages/plans/plans"
import { Users } from "@/pages/user/users"
import { ErpSettings } from "@/pages/erp-setting/erp-setting"
import { CreatePlan } from "@/pages/plans/create-plan"
import { Profile } from "@/pages/profile/profile"

// Import Platform Standard Content pages
import { DataTypes } from "@/pages/platform-standard-content/data-type/data-types"
import { FieldCategories } from "@/pages/platform-standard-content/field-categories/field-categories"
import { ReferenceLists } from "@/pages/platform-standard-content/reference-lists/reference-lists"
import { ValidationRules } from "@/pages/platform-standard-content/validation-rules"
import { NormalizationRules } from "@/pages/platform-standard-content/normalization-rules"
import { ExtractionFields } from "@/pages/platform-standard-content/extraction-fields"
import { DerivedTemplates } from "@/pages/platform-standard-content/derived-templates"
import { ExtractionTemplateLayouts } from "@/pages/platform-standard-content/extraction-template-layouts"

export type AppSubRoute = {
  path: string;
  title: string;
  icon: LucideIcon;
  component: ComponentType;
}

export type AppRoute = {
  path: string;
  title: string;
  icon: LucideIcon;
  component?: ComponentType;
  showInSidebar?: boolean;
  children?: AppSubRoute[];
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
        path: "/platform-standard-content/extraction-fields",
        title: "Extraction Fields",
        icon: FileText,
        component: ExtractionFields,
      },
      {
        path: "/platform-standard-content/derived-templates",
        title: "Derived Templates",
        icon: FileCheck,
        component: DerivedTemplates,
      },
      {
        path: "/platform-standard-content/extraction-template-layouts",
        title: "Template Layouts",
        icon: LayoutTemplate,
        component: ExtractionTemplateLayouts,
      },
    ]
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
  }
]


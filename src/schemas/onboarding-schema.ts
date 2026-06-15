import { z } from "zod"
import type { ReplicationSettings } from "@/pages/organization/modals/replication-step"

export const onboardingSchema = z.object({
  orgName: z
    .string()
    .min(2, "Organization name must be at least 2 characters."),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Slug can only contain letters, numbers, and hyphens."
    ),
  tenant_role: z.string().min(1, "Tenant role is required."),
  admin_full_name: z.string().min(1, "Full name is required."),
  admin_email: z.email("Please enter a valid email address."),
  admin_password: z.string().min(6, "Password must be at least 6 characters."),
  plan_id: z.string().optional(),
})

export type FormValues = z.infer<typeof onboardingSchema>

export const DEFAULT_FORM_VALUES = (name = ""): Partial<FormValues> => ({
  orgName: name,
  slug: "",
  tenant_role: "",
  admin_full_name: "",
  admin_email: "",
  admin_password: "",
  plan_id: "",
})

export const DEFAULT_REPLICATION_SETTINGS: ReplicationSettings = {
  extraction_fields: true,
  extraction_templates: true,
  tenant_configurations: true,
  organisation_configurations: true,
  tenant_profiles: true,
  organisation_profiles: true,
}

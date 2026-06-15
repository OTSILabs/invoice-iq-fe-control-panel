import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { InputField } from "../../../components/ui/input-field"
import { Plus, Loader2 } from "lucide-react"
import { useFormContext } from "react-hook-form"
import type { Organization, Plan } from "@/types"
import { OrganizationSection } from "./organization-section"
import { PlanSelectionSection } from "./plan-selection-section"

interface OnboardingFormStepProps {
  existingOrganization?: { id: string; name: string }
  organizations: Organization[]
  isOrgsLoading: boolean
  plans?: Plan[]
  isPlansLoading: boolean
  isCreatingOrg: boolean
  selectedOrgId: string
  isCreatingPlan: boolean
  setIsCreatingPlan: (value: boolean) => void
  handleToggleCreatingOrg: (value: boolean) => void
  handleOrgChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onSubmitForm: (e: React.FormEvent) => void
  handleInlinePlanSuccess: (newPlan?: { id?: string } | null) => void
  isPending: boolean
  isFormReadyToSubmit: boolean
}

export function OnboardingFormStep({
  existingOrganization,
  organizations,
  isOrgsLoading,
  plans,
  isPlansLoading,
  isCreatingOrg,
  selectedOrgId,
  isCreatingPlan,
  setIsCreatingPlan,
  handleToggleCreatingOrg,
  handleOrgChange,
  onSubmitForm,
  handleInlinePlanSuccess,
  isPending,
  isFormReadyToSubmit,
}: OnboardingFormStepProps) {
  const { register, formState: { errors } } = useFormContext()

  return (
    <>
      <DialogHeader className="border-b border-border bg-popover px-8 py-6 select-none">
        <div className="max-w-2xl">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {existingOrganization
              ? "Add Tenant to Organization"
              : "Welcome! Let's get started"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {existingOrganization
              ? "Configure tenant details and select a billing plan for this organization."
              : "Follow this onboarding process to set up your new organization and tenant."}
          </DialogDescription>
        </div>
      </DialogHeader>

      <ScrollArea className="h-full min-h-0 min-w-0 flex-1 bg-muted/10">
        <div className="p-6 md:p-8 pb-16 space-y-8 bg-popover">
          <form
            id="create-all-form"
            onSubmit={onSubmitForm}
            className="space-y-8"
            noValidate
          >
            {/* Organization Details Section */}
            <OrganizationSection
              existingOrganization={existingOrganization}
              organizations={organizations}
              isOrgsLoading={isOrgsLoading}
              isCreatingOrg={isCreatingOrg}
              selectedOrgId={selectedOrgId}
              handleToggleCreatingOrg={handleToggleCreatingOrg}
              handleOrgChange={handleOrgChange}
            />

            {/* Tenant Configuration Section */}
            <div className="space-y-4 border-t border-border pt-6">
              <div>
                <h3 className="mb-1 text-base font-bold text-foreground">
                  2. Tenant Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure the technical and administrative settings.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1">
                  <InputField
                    id="slug"
                    label="Tenant Slug"
                    required
                    error={errors.slug?.message ? String(errors.slug.message) : undefined}
                    placeholder="acme-corp"
                    {...register("slug")}
                  />
                </div>
                <div className="space-y-1">
                  <InputField
                    id="role"
                    label="Tenant Role"
                    type="select"
                    required
                    error={errors.tenant_role?.message ? String(errors.tenant_role.message) : undefined}
                    {...register("tenant_role")}
                  >
                    <option value="" disabled>Select Tenant Role</option>
                    <option value="sandbox">sandbox</option>
                    <option value="prod">prod</option>
                  </InputField>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Admin User Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <InputField
                      id="adminName"
                      label="Full Name"
                      required
                      error={errors.admin_full_name?.message ? String(errors.admin_full_name.message) : undefined}
                      placeholder="e.g. John Doe"
                      {...register("admin_full_name")}
                    />
                  </div>
                  <div className="space-y-1">
                    <InputField
                      id="adminEmail"
                      label="Email Address"
                      type="email"
                      required
                      error={errors.admin_email?.message ? String(errors.admin_email.message) : undefined}
                      placeholder="john@example.com"
                      {...register("admin_email")}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <InputField
                      id="adminPass"
                      label="Temporary Password"
                      type="password"
                      required
                      error={errors.admin_password?.message ? String(errors.admin_password.message) : undefined}
                      placeholder="Enter a secure password"
                      {...register("admin_password")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Selection Section */}
            <PlanSelectionSection
              plans={plans}
              isPlansLoading={isPlansLoading}
              isCreatingPlan={isCreatingPlan}
              setIsCreatingPlan={setIsCreatingPlan}
              handleInlinePlanSuccess={handleInlinePlanSuccess}
            />
          </form>
        </div>
      </ScrollArea>

      <DialogFooter className="flex flex-col-reverse gap-3 border-t border-border bg-popover px-8 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="mt-2 w-full sm:mt-0 sm:w-auto"></div>
        <Button
          type="submit"
          size="sm"
          form={isCreatingPlan ? "inline-plan-form" : "create-all-form"}
          className="w-full px-3 font-medium bg-primary hover:bg-primary/90 text-white shadow-none sm:w-auto cursor-pointer"
          disabled={isPending || !isFormReadyToSubmit}
        >
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          {existingOrganization ? "Create Tenant" : "Create Tenant"}
        </Button>
      </DialogFooter>
    </>
  )
}

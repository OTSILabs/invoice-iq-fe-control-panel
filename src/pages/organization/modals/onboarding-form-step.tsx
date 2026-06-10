import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { InputField } from "../../../components/ui/input-field"
import { FieldLabel } from "../../../components/ui/field"
import { Plus, Minus, ArrowLeft, Loader2 } from "lucide-react"
import { PlanForm } from "@/pages/plans/plan-form-dailog"
import { useFormContext } from "react-hook-form"
import type { Organization, Plan } from "@/types"

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
  const { register, setValue, formState: { errors } } = useFormContext()

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
        <div className="p-6 md:p-8 pb-16 space-y-8">
          <form
            id="create-all-form"
            onSubmit={onSubmitForm}
            className="space-y-8"
          >
            {/* Organization Section */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-base font-bold text-foreground">
                  1. Organization Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  {existingOrganization 
                    ? "Adding tenant to pre-selected organization." 
                    : "Choose an existing organization or set up a new one."}
                </p>
              </div>

              <div className="space-y-1">
                <FieldLabel
                  htmlFor={isCreatingOrg ? "orgName" : "existingOrgSelect"}
                >
                  {existingOrganization
                    ? "Organization"
                    : isCreatingOrg
                    ? "Organization name"
                    : "Organization"}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>

                {!isCreatingOrg ? (
                  <>
                  <InputField
                    id="existingOrgSelect"
                    type="select"
                    value={selectedOrgId}
                    onChange={(e) => {
                      if (e.target.value === "__create__") {
                        handleToggleCreatingOrg(true);
                      } else {
                        handleOrgChange(e as React.ChangeEvent<HTMLSelectElement>);
                      }
                    }}
                  >
                    <option value="" disabled>Select Organization</option>

                    {isOrgsLoading ? (
                      <option value="" disabled>
                        Loading organizations…
                      </option>
                    ) : organizations.length === 0 ? (
                      <option value="" disabled>
                        No organizations found
                      </option>
                    ) : (
                      organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))
                    )}

                     {/* <option
        value="__create__"
        className="text-primary font-medium border-t border-border center"
      >
        + Create organization
      </option> */}
                  </InputField>
                   <Button
      // type="button"
     variant="text"
                      size="xs"
                      className= "text-primary hover:text-primary/80"
          onClick={() => handleToggleCreatingOrg(true)}
     
    >
      <Plus className="size-3" />
      Create organization
    </Button>
                  </>
                  
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <InputField
                        id="orgName"
                        placeholder="e.g. Acme Corp"
                        className="flex-1"
                        {...register("orgName")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 shrink-0 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => handleToggleCreatingOrg(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    {errors.orgName && (
                      <span className="px-0.5 text-[11px] font-medium text-destructive">
                        {String(errors.orgName.message)}
                      </span>
                    )}
                  </>
                )}

                {existingOrganization && (
                  <p className="text-[11px] text-muted-foreground">
                    Defaults to the pre-selected organization. You can select another if needed.
                  </p>
                )}
              </div>
            </div>

            {/* Tenant Section */}
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
                    placeholder="acme-corp"
                    {...register("slug")}
                  />
                  {errors.slug && (
                    <span className="px-1 text-[11px] font-medium text-destructive">
                      {String(errors.slug.message)}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <InputField
                    id="role"
                    label="Tenant Role"
                    type="select"
                    {...register("tenant_role")}
                  >
                    <option value="" disabled>Select Tenant Role</option>
                    <option value="sandbox">sandbox</option>
                    <option value="prod">prod</option>
                  </InputField>
                  {errors.tenant_role && (
                    <span className="px-1 text-[11px] font-medium text-destructive">
                      {String(errors.tenant_role.message)}
                    </span>
                  )}
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
                      placeholder="e.g. John Doe"
                      {...register("admin_full_name")}
                    />
                    {errors.admin_full_name && (
                      <span className="px-1 text-[11px] font-medium text-destructive">
                        {String(errors.admin_full_name.message)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <InputField
                      id="adminEmail"
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      {...register("admin_email")}
                    />
                    {errors.admin_email && (
                      <span className="px-1 text-[11px] font-medium text-destructive">
                        {String(errors.admin_email.message)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <InputField
                      id="adminPass"
                      label="Temporary Password"
                      type="password"
                      placeholder="Enter a secure password"
                      {...register("admin_password")}
                    />
                    {errors.admin_password && (
                      <span className="px-1 text-[11px] font-medium text-destructive">
                        {String(errors.admin_password.message)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Section */}
            <div className="space-y-4 border-t border-border pt-6">
              <div>
                <h3 className="mb-1 text-base font-bold text-foreground">
                  3. Plan Selection
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a billing tier for this organization.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="planSelect"
                    className="text-xs font-semibold leading-none text-foreground"
                  >
                    Select Plan <span className="text-destructive">*</span>
                  </label>
                  {isCreatingPlan ? (
                    <Button
                     variant="text"
                      size="xs"
                     className= "text-primary hover:text-primary/80"
                      onClick={() => setIsCreatingPlan(false)}
                    >
                      <ArrowLeft className="mr-1 h-3 w-3" /> Select Plan
                    </Button>
                  ) : (
                    <Button
                      // type="button"
                      variant="text"
                      size="xs"
                      className= "text-primary hover:text-primary/80"
                      onClick={() => {
                        setValue("plan_id", "")
                        setIsCreatingPlan(true)
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Plan
                    </Button>
                  )}
                </div>
                <InputField
                  id="planSelect"
                  type="select"
                  disabled={isCreatingPlan}
                  {...register("plan_id")}
                >
                  <option value="" disabled>
                    {isPlansLoading ? "Loading plans..." : "Select a plan"}
                  </option>
                  {plans?.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.description}
                    </option>
                  ))}
                </InputField>
              </div>
            </div>
          </form>

          {isCreatingPlan && (
            <div className="mt-4 animate-in border-t border-border pt-6 duration-300 fade-in slide-in-from-bottom-4">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="mb-1 text-sm font-bold text-foreground">
                    Create New Plan
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Add a new plan to the system. It will be
                    automatically available to select once created.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  onClick={() => setIsCreatingPlan(false)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
              <PlanForm
                formId="inline-plan-form"
                showFooter={false}
                onCancel={() => setIsCreatingPlan(false)}
                onSuccess={handleInlinePlanSuccess}
              />
            </div>
          )}
        </div>
      </ScrollArea>
      
      <DialogFooter className="flex flex-col-reverse gap-3 border-t border-border bg-popover px-8 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="mt-2 w-full sm:mt-0 sm:w-auto"></div>
        <Button
          type="submit"
          size={"sm"}
          form={isCreatingPlan ? "inline-plan-form" : "create-all-form"}
          className="w-full px-3 font-medium bg-primary hover:bg-primary/90 text-white shadow-none sm:w-auto cursor-pointer"
          disabled={isPending || (!isCreatingPlan && !isFormReadyToSubmit)}
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

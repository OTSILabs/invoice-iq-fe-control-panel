import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, Plus } from "lucide-react"

import { plansService } from "@/api/services/plans.service"
import {
  useOnboardOrganizationAndTenant,
  useOrganizationDetail,
  useOrganizations,
  useReplicateMasterData,
} from "@/api/hooks/useOrganizations"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageShell, SectionCard } from "@/components/invoice-ui/design-system"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/ui/input-field"
import { toast } from "@/lib/toast"
import { OrganizationSection } from "./components/organization-section"
import { PlanSelectionSection } from "./components/plan-selection-section"
import { ReplicationStep } from "./components/replication-step"
import {
  DEFAULT_FORM_VALUES,
  DEFAULT_REPLICATION_SETTINGS,
  onboardingSchema,
  type FormValues,
} from "@/schemas/onboarding-schema"
import type { CreatedTenantState, ReplicationSettings } from "@/types"

export function OrganizationOnboardingPage() {
  const { orgId = "" } = useParams<{ orgId: string }>()
  const navigate = useNavigate()
  const { data: organizations = [], isLoading: isOrgsLoading } = useOrganizations()
  const { data: organization, isLoading: isOrgDetailLoading } = useOrganizationDetail(orgId)
  const { data: plans, isLoading: isPlansLoading } = useQuery({ queryKey: ["plans"], queryFn: plansService.getAll })
  const { mutate: onboardTenant, isPending } = useOnboardOrganizationAndTenant()
  const { mutate: replicateMasterData, isPending: isReplicating } = useReplicateMasterData()

  const existingOrganization = organization ? { id: organization.id, name: organization.name } : undefined
  const [createdTenant, setCreatedTenant] = useState<CreatedTenantState | null>(null)
  const [replicationSettings, setReplicationSettings] = useState<ReplicationSettings>(DEFAULT_REPLICATION_SETTINGS)
  const [onboardState, setOnboardState] = useState({
    isCreatingOrgOverride: !orgId,
    isCreatingPlan: false,
    selectedOrgId: orgId,
  })

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES(),
  })

  const { handleSubmit, watch, setValue, reset, formState: { isValid } } = formMethods

  useEffect(() => {
    if (!organization) return
    setOnboardState((current) => ({
      ...current,
      isCreatingOrgOverride: false,
      selectedOrgId: organization.id,
    }))
    reset(DEFAULT_FORM_VALUES(organization.name))
  }, [organization, reset])

  const isCreatingOrg = onboardState.isCreatingOrgOverride
  const isFormReadyToSubmit = isValid && (!!watch("plan_id") || onboardState.isCreatingPlan)

  const handleToggleCreatingOrg = (create: boolean) => {
    setOnboardState((s) => ({ ...s, isCreatingOrgOverride: create }))

    if (!create && organizations.length > 0) {
      const selectedId = onboardState.selectedOrgId || orgId || organizations[0]?.id || ""
      const org = organizations.find((o) => o.id === selectedId)
      setOnboardState((s) => ({ ...s, selectedOrgId: selectedId }))
      setValue("orgName", org?.name ?? "", { shouldValidate: !!org })
      return
    }

    setValue("orgName", "", { shouldValidate: false })
  }

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setOnboardState((s) => ({ ...s, selectedOrgId: id }))
    const org = organizations.find((o) => o.id === id)
    if (org) setValue("orgName", org.name, { shouldValidate: true })
  }

  const onSubmit = (data: FormValues, planIdOverride?: string) => {
    const finalPlanId = planIdOverride || data.plan_id
    if (!finalPlanId) {
      toast.error("Plan ID is required", "Plan ID is required to create a tenant.")
      return
    }

    onboardTenant(
      {
        orgName: data.orgName,
        slug: data.slug,
        tenant_role: data.tenant_role,
        admin_full_name: data.admin_full_name,
        admin_email: data.admin_email,
        admin_password: data.admin_password,
        plan_id: finalPlanId,
        existingOrgId: isCreatingOrg ? undefined : onboardState.selectedOrgId || undefined,
      },
      {
        onSuccess: (tenant) => {
          setCreatedTenant(tenant)
          toast.success("Tenant created successfully!")
        },
        onError: (error) => {
          toast.error(error, isCreatingOrg
            ? "Failed to create organization and tenant. Please try again."
            : "Failed to add tenant. Please try again."
          )
        },
      }
    )
  }

  const handleInlinePlanSuccess = (newPlan?: { id?: string } | null) => {
    const planId = newPlan?.id ?? ""
    setValue("plan_id", planId)
    onSubmit(watch(), planId)
  }

  const finishOnboarding = (orgIdToOpen: string) => navigate(`/organizations/${orgIdToOpen}`)

  const handleReplicateMasterData = () => {
    if (!createdTenant) return
    replicateMasterData(
      { tenantId: createdTenant.id, settings: replicationSettings },
      {
        onSuccess: () => {
          toast.success("Success", "Tenant Onboarded Successfully")
          finishOnboarding(createdTenant.orgId)
        },
        onError: (error) => toast.error(error, "Failed to replicate master data. Please try again."),
      }
    )
  }

  if (orgId && isOrgDetailLoading) {
    return (
      <PageShell className="min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title={existingOrganization ? "Add Tenant" : "Start Onboarding"}
        description={existingOrganization ? `Configure a new tenant for ${existingOrganization.name}.` : "Set up an organization, tenant, admin access, and billing plan."}
      >
        <Button variant="outline" size="sm" onClick={() => navigate(existingOrganization ? `/organizations/${existingOrganization.id}` : "/organizations")}>
          <ArrowLeft className="size-4" /> {existingOrganization ? "Back to Organization" : "Back to Organizations"}
        </Button>
      </PageHeader>

      {createdTenant ? (
        <SectionCard className="max-w-xl">
          <ReplicationStep
            createdTenant={createdTenant}
            isReplicating={isReplicating}
            replicationSettings={replicationSettings}
            setReplicationSettings={setReplicationSettings}
            onSkip={() => {
              toast.info("Onboarding completed", "You can replicate master data later.")
              finishOnboarding(createdTenant.orgId)
            }}
            onReplicate={handleReplicateMasterData}
          />
        </SectionCard>
      ) : (
        <SectionCard className="max-w-5xl">
          <FormProvider {...formMethods}>
            <form
              id="create-all-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit((d) => onSubmit(d))()
              }}
              className="space-y-8"
              noValidate
            >
              <OrganizationSection
                existingOrganization={existingOrganization}
                organizations={organizations}
                isOrgsLoading={isOrgsLoading}
                isCreatingOrg={isCreatingOrg}
                selectedOrgId={onboardState.selectedOrgId}
                handleToggleCreatingOrg={handleToggleCreatingOrg}
                handleOrgChange={handleOrgChange}
              />

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
                  <InputField id="slug" label="Tenant Slug" required error={formMethods.formState.errors.slug?.message} placeholder="acme-corp" {...formMethods.register("slug")} />
                  <InputField id="role" label="Tenant Role" type="select" required error={formMethods.formState.errors.tenant_role?.message} {...formMethods.register("tenant_role")}>
                    <option value="" disabled>Select Tenant Role</option>
                    <option value="sandbox">sandbox</option>
                    <option value="prod">prod</option>
                  </InputField>
                </div>
                <div className="pt-4">
                  <h4 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Admin User Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField id="adminName" label="Full Name" required error={formMethods.formState.errors.admin_full_name?.message} placeholder="e.g. John Doe" {...formMethods.register("admin_full_name")} />
                    <InputField id="adminEmail" label="Email Address" type="email" required error={formMethods.formState.errors.admin_email?.message} placeholder="john@example.com" {...formMethods.register("admin_email")} />
                    <InputField id="adminPass" label="Temporary Password" type="password" required error={formMethods.formState.errors.admin_password?.message} placeholder="Enter a secure password" className="sm:col-span-2" {...formMethods.register("admin_password")} />
                  </div>
                </div>
              </div>

              <PlanSelectionSection
                plans={plans}
                isPlansLoading={isPlansLoading}
                isCreatingPlan={onboardState.isCreatingPlan}
                setIsCreatingPlan={(create) => setOnboardState((s) => ({ ...s, isCreatingPlan: create }))}
                handleInlinePlanSuccess={handleInlinePlanSuccess}
              />

              <div className="dialog-form-footer -mx-5 -mb-5 mt-6 rounded-b-xl">
                <Button type="button" variant="outline" onClick={() => navigate(existingOrganization ? `/organizations/${existingOrganization.id}` : "/organizations")} disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form={onboardState.isCreatingPlan ? "inline-plan-form" : "create-all-form"}
                  disabled={isPending || !isFormReadyToSubmit}
                >
                  {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                  Create Tenant
                </Button>
              </div>
            </form>
          </FormProvider>
        </SectionCard>
      )}
    </PageShell>
  )
}

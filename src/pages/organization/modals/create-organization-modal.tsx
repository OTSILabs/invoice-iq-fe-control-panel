import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { plansService } from "@/api/services/plans.service"
import {
  useOnboardOrganizationAndTenant,
  useReplicateMasterData,
  useOrganizations,
} from "@/api/hooks/useOrganizations"
import { toast } from "@/lib/toast"
import { ReplicationStep, type CreatedTenantState, type ReplicationSettings } from "./replication-step"
import { OnboardingFormStep } from "./onboarding-form-step"
import {
  onboardingSchema,
  type FormValues,
  DEFAULT_FORM_VALUES,
  DEFAULT_REPLICATION_SETTINGS,
} from "@/schemas/onboarding-schema"

interface Props {
  children?: React.ReactNode
  existingOrganization?: { id: string; name: string }
}

export function CreateOrganizationModal({ children, existingOrganization }: Props) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [isCreatingOrgOverride, setIsCreatingOrgOverride] = useState(false)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState(existingOrganization?.id ?? "")
  const [createdTenant, setCreatedTenant] = useState<CreatedTenantState | null>(null)
  const [replicationSettings, setReplicationSettings] = useState<ReplicationSettings>(DEFAULT_REPLICATION_SETTINGS)

  const { data: organizations = [], isLoading: isOrgsLoading } = useOrganizations()
  const { data: plans, isLoading: isPlansLoading } = useQuery({ queryKey: ["plans"], queryFn: plansService.getAll })
  const { mutate: onboardTenant, isPending } = useOnboardOrganizationAndTenant()
  const { mutate: replicateMasterData, isPending: isReplicating } = useReplicateMasterData()

  const isCreatingOrg = isCreatingOrgOverride || (!isOrgsLoading && organizations.length === 0)

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES(existingOrganization?.name),
  })

  const { handleSubmit, reset, watch, setValue, formState: { isValid } } = formMethods

  const updateSearchParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams)
    value ? params.set(key, value) : params.delete(key)
    setSearchParams(params)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      if (existingOrganization) {
        setSelectedOrgId(existingOrganization.id)
        setValue("orgName", existingOrganization.name, { shouldValidate: true })
      } else {
        setSelectedOrgId("")
        setValue("orgName", "", { shouldValidate: true })
        updateSearchParam("org_id")
      }
      if (!isOrgsLoading && organizations.length === 0) {
        setIsCreatingOrgOverride(true)
      }
    } else {
      setTimeout(() => {
        setIsCreatingPlan(false)
        setIsCreatingOrgOverride(false)
        setCreatedTenant(null)
        setReplicationSettings({ ...DEFAULT_REPLICATION_SETTINGS })
        reset(DEFAULT_FORM_VALUES(existingOrganization?.name))
        setSelectedOrgId(existingOrganization?.id ?? "")
        updateSearchParam("org_id")
      }, 300)
    }
  }

  const handleToggleCreatingOrg = (create: boolean) => {
    setIsCreatingOrgOverride(create)

    if (!create && organizations.length > 0) {
      const org = organizations.find((o) => o.id === selectedOrgId)
      setValue("orgName", org?.name ?? "", { shouldValidate: true })
      org ? updateSearchParam("org_id", selectedOrgId) : updateSearchParam("org_id")
    } else {
      setValue("orgName", "", { shouldValidate: true })
      updateSearchParam("org_id")
    }
  }

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedOrgId(id)
    const org = organizations.find((o) => o.id === id)
    if (org) setValue("orgName", org.name, { shouldValidate: true })
    updateSearchParam("org_id", id)
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
        existingOrgId: isCreatingOrg ? undefined : selectedOrgId || undefined,
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

  const handleReplicateMasterData = () => {
    if (!createdTenant) return
    replicateMasterData(
      { tenantId: createdTenant.id, settings: replicationSettings },
      {
        onSuccess: () => {
          handleOpenChange(false)
          toast.success("Success", "Tenant Onboarded Successfully")
          navigate(`/organizations/${createdTenant.orgId}`)
        },
        onError: (error) => toast.error(error, "Failed to replicate master data. Please try again."),
      }
    )
  }

  const isFormReadyToSubmit = isValid && (!!watch("plan_id") || isCreatingPlan)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent
        showCloseButton={!isReplicating}
        className={
          createdTenant
            ? "flex flex-col gap-6 overflow-hidden border-border bg-popover p-6 shadow-lg sm:max-w-md sm:rounded-xl"
            : "grid max-h-[86vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-border bg-popover p-0 shadow-lg sm:max-w-3xl sm:rounded-xl"
        }
      >
        {createdTenant ? (
          <ReplicationStep
            createdTenant={createdTenant}
            isReplicating={isReplicating}
            replicationSettings={replicationSettings}
            setReplicationSettings={setReplicationSettings}
            onSkip={() => {
              handleOpenChange(false)
              toast.info("Onboarding completed", "You can replicate master data later.")
              navigate(`/organizations/${createdTenant.orgId}`)
            }}
            onReplicate={handleReplicateMasterData}
          />
        ) : (
          <FormProvider {...formMethods}>
            <OnboardingFormStep
              existingOrganization={existingOrganization}
              organizations={organizations}
              isOrgsLoading={isOrgsLoading}
              plans={plans}
              isPlansLoading={isPlansLoading}
              isCreatingOrg={isCreatingOrg}
              selectedOrgId={selectedOrgId}
              isCreatingPlan={isCreatingPlan}
              setIsCreatingPlan={setIsCreatingPlan}
              handleToggleCreatingOrg={handleToggleCreatingOrg}
              handleOrgChange={handleOrgChange}
              onSubmitForm={(e) => { e.preventDefault(); handleSubmit((d) => onSubmit(d))() }}
              handleInlinePlanSuccess={handleInlinePlanSuccess}
              isPending={isPending}
              isFormReadyToSubmit={isFormReadyToSubmit}
            />
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
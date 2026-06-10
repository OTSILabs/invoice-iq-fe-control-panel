// import { useState, useEffect } from "react"
// import { useQuery } from "@tanstack/react-query"
// import { useSearchParams, useNavigate } from "react-router-dom"
// import { useForm, FormProvider } from "react-hook-form"
// import { z } from "zod"
// import { zodResolver } from "@hookform/resolvers/zod"

// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
// import { plansService } from "@/api/services/plans.service"
// import {
//   useOnboardOrganizationAndTenant,
//   useReplicateMasterData,
//   useOrganizations,
// } from "@/api/hooks/useOrganizations"
// import { toast } from "@/lib/toast"

// import {
//   ReplicationStep,
//   type CreatedTenantState,
//   type ReplicationSettings,
// } from "./replication-step"
// import { OnboardingFormStep } from "./onboarding-form-step"

// const onboardingSchema = z.object({
//   orgName: z
//     .string()
//     .min(2, "Organization name must be at least 2 characters."),
//   slug: z
//     .string()
//     .min(2, "Slug is required.")
//     .regex(
//       /^[a-zA-Z0-9-]+$/,
//       "Slug can only contain letters, numbers, and hyphens."
//     ),
//   tenant_role: z.string().min(1, "Tenant role is required."),
//   admin_full_name: z.string().min(1, "Full name is required."),
//   admin_email: z.string().email("Please enter a valid email address."),
//   admin_password: z.string().min(6, "Password must be at least 6 characters."),
//   plan_id: z.string().optional(),
// })

// type FormValues = z.infer<typeof onboardingSchema>

// const defaultReplicationSettings: ReplicationSettings = {
//   extraction_fields: true,
//   extraction_templates: true,
//   tenant_configurations: true,
//   organisation_configurations: true,
//   tenant_profiles: true,
//   organisation_profiles: true,
// }

// export function CreateOrganizationModal({
//   children,
//   existingOrganization,
// }: {
//   children?: React.ReactNode
//   existingOrganization?: { id: string; name: string }
// }) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [hasInitialized, setHasInitialized] = useState(false)
//   const [isCreatingPlan, setIsCreatingPlan] = useState(false)
//   const [createdTenant, setCreatedTenant] = useState<CreatedTenantState | null>(
//     null
//   )
//   const [replicationSettings, setReplicationSettings] =
//     useState<ReplicationSettings>(defaultReplicationSettings)

//   const navigate = useNavigate()
//   const [searchParams, setSearchParams] = useSearchParams()
//   const [isCreatingOrg, setIsCreatingOrg] = useState<boolean>(false)
//   const [selectedOrgId, setSelectedOrgId] = useState<string>("")

//   const { data: organizations = [], isLoading: isOrgsLoading } = useOrganizations()

//   const { data: plans, isLoading: isPlansLoading } = useQuery({
//     queryKey: ["plans"],
//     queryFn: plansService.getAll,
//   })

//   const { mutate: onboardTenant, isPending } = useOnboardOrganizationAndTenant()
//   const { mutate: replicateMasterData, isPending: isReplicating } = useReplicateMasterData()

//   const formMethods = useForm<FormValues>({
//     resolver: zodResolver(onboardingSchema),
//     mode: "onChange",
//     defaultValues: {
//       orgName: existingOrganization?.name || "",
//       slug: "",
//       tenant_role: "",
//       admin_full_name: "",
//       admin_email: "",
//       admin_password: "",
//       plan_id: "",
//     },
//   })

//   const {
//     handleSubmit,
//     reset,
//     watch,
//     setValue,
//     formState: { isValid },
//   } = formMethods

//   useEffect(() => {
//     if (isOpen && !isOrgsLoading && !hasInitialized) {
//       setHasInitialized(true)
//       if (!isCreatingOrg) {
//         if (existingOrganization) {
//           setSelectedOrgId(existingOrganization.id)
//           setValue("orgName", existingOrganization.name, { shouldValidate: true })
//         } else {
//           setSelectedOrgId("")
//           setValue("orgName", "", { shouldValidate: true })
//           const params = new URLSearchParams(searchParams)
//           params.delete("org_id")
//           setSearchParams(params)
//         }
//       }
//     } else if (isOpen && !isOrgsLoading && !existingOrganization && organizations.length === 0 && !hasInitialized) {
//       setHasInitialized(true)
//       setIsCreatingOrg(true)
//     }
//   }, [isOpen, isOrgsLoading, organizations, existingOrganization, hasInitialized])

//   const handleOpenChange = (open: boolean) => {
//     setIsOpen(open)
//     if (!open) {
//       setHasInitialized(false)
//       setTimeout(() => {
//         setIsCreatingPlan(false)
//         setIsCreatingOrg(false)
//         setCreatedTenant(null)
//         setReplicationSettings({ ...defaultReplicationSettings })
//         reset({
//           orgName: existingOrganization?.name || "",
//           slug: "",
//           tenant_role: "",
//           admin_full_name: "",
//           admin_email: "",
//           admin_password: "",
//           plan_id: "",
//         })
//         const params = new URLSearchParams(searchParams)
//         params.delete("org_id")
//         setSearchParams(params)
//       }, 300)
//     }
//   }

//   const handleToggleCreatingOrg = (create: boolean) => {
//     setIsCreatingOrg(create)
//     if (!create) {
//       if (organizations.length > 0) {
//         const currentId = selectedOrgId || ""
//         setSelectedOrgId(currentId)
//         const org = organizations.find((o) => o.id === currentId)
//         if (org) {
//           setValue("orgName", org.name, { shouldValidate: true })
//           const params = new URLSearchParams(searchParams)
//           params.set("org_id", currentId)
//           setSearchParams(params)
//         } else {
//           setValue("orgName", "", { shouldValidate: true })
//           const params = new URLSearchParams(searchParams)
//           params.delete("org_id")
//           setSearchParams(params)
//         }
//       } else {
//         setValue("orgName", "", { shouldValidate: true })
//       }
//     } else {
//       setValue("orgName", "", { shouldValidate: true })
//       const params = new URLSearchParams(searchParams)
//       params.delete("org_id")
//       setSearchParams(params)
//     }
//   }

//   const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const id = e.target.value
//     setSelectedOrgId(id)
//     const org = organizations.find((o) => o.id === id)
//     if (org) {
//       setValue("orgName", org.name, { shouldValidate: true })
//     }
//     const params = new URLSearchParams(searchParams)
//     params.set("org_id", id)
//     setSearchParams(params)
//   }

//   const onSubmit = (data: FormValues, planIdOverride?: string) => {
//     const finalPlanId = planIdOverride || data.plan_id
//     if (!finalPlanId) {
//       toast.error("Plan ID is required", "Plan ID is required to create a tenant.")
//       return
//     }

//     const finalOrgId = !isCreatingOrg ? (selectedOrgId || undefined) : undefined

//     onboardTenant(
//       {
//         orgName: data.orgName,
//         slug: data.slug,
//         tenant_role: data.tenant_role,
//         admin_full_name: data.admin_full_name,
//         admin_email: data.admin_email,
//         admin_password: data.admin_password,
//         plan_id: finalPlanId,
//         existingOrgId: finalOrgId,
//       },
//       {
//         onSuccess: (tenant) => {
//           setCreatedTenant(tenant)
//           toast.success("Tenant created successfully!")
//         },
//         onError: (error) => {
//           toast.error(
//             error,
//             finalOrgId
//               ? "Failed to add tenant. Please try again."
//               : "Failed to create organization and tenant. Please try again."
//           )
//         },
//       }
//     )
//   }

//   const handleInlinePlanSuccess = (newPlan?: { id?: string } | null) => {
//     setValue("plan_id", newPlan?.id || "")
//     const values = watch()
//     onSubmit(values, newPlan?.id || "")
//   }

//   const handleReplicateMasterData = () => {
//     if (!createdTenant) return

//     replicateMasterData(
//       { tenantId: createdTenant.id, settings: replicationSettings },
//       {
//         onSuccess: () => {
//           handleOpenChange(false)
//           toast.success("Success", "Tenant Onboarded Successfully")
//           navigate(`/organizations/${createdTenant.orgId}`)
//         },
//         onError: (error) => {
//           toast.error(
//             error,
//             "Failed to replicate master data. Please try again."
//           )
//         },
//       }
//     )
//   }

//   const isFormReadyToSubmit = isValid && (!!watch("plan_id") || isCreatingPlan)

//   return (
//     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
//       {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
//       <DialogContent
//         showCloseButton={!isReplicating}
//         className={
//           createdTenant
//             ? "flex flex-col gap-6 overflow-hidden border-border bg-popover p-6 shadow-lg sm:max-w-md sm:rounded-xl"
//             : "grid max-h-[86vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-border bg-popover p-0 shadow-lg sm:max-w-3xl sm:rounded-xl"
//         }
//       >
//         {createdTenant ? (
//           <ReplicationStep
//             createdTenant={createdTenant}
//             isReplicating={isReplicating}
//             replicationSettings={replicationSettings}
//             setReplicationSettings={setReplicationSettings}
//             onSkip={() => {
//               handleOpenChange(false)
//               toast.info("Onboarding completed", "You can replicate master data later.")
//               navigate(`/organizations/${createdTenant.orgId}`)
//             }}
//             onReplicate={handleReplicateMasterData}
//           />
//         ) : (
//           <FormProvider {...formMethods}>
//             <OnboardingFormStep
//               existingOrganization={existingOrganization}
//               organizations={organizations}
//               isOrgsLoading={isOrgsLoading}
//               plans={plans}
//               isPlansLoading={isPlansLoading}
//               isCreatingOrg={isCreatingOrg}
//               selectedOrgId={selectedOrgId}
//               isCreatingPlan={isCreatingPlan}
//               setIsCreatingPlan={setIsCreatingPlan}
//               handleToggleCreatingOrg={handleToggleCreatingOrg}
//               handleOrgChange={handleOrgChange}
//               onSubmitForm={(e) => {
//                 e.preventDefault()
//                 handleSubmit((d) => onSubmit(d))()
//               }}
//               handleInlinePlanSuccess={handleInlinePlanSuccess}
//               isPending={isPending}
//               isFormReadyToSubmit={isFormReadyToSubmit}
//             />
//           </FormProvider>
//         )}
//       </DialogContent>
//     </Dialog>
//   )
// }


import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { z } from "zod"
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

// ─── Schema ───────────────────────────────────────────────────────────────────

const onboardingSchema = z.object({
  orgName:        z.string().min(2, "Organization name must be at least 2 characters."),
  slug:           z.string().min(2, "Slug is required.").regex(/^[a-zA-Z0-9-]+$/, "Slug can only contain letters, numbers, and hyphens."),
  tenant_role:    z.string().min(1, "Tenant role is required."),
  admin_full_name:z.string().min(1, "Full name is required."),
  admin_email:    z.string().email("Please enter a valid email address."),
  admin_password: z.string().min(6, "Password must be at least 6 characters."),
  plan_id:        z.string().optional(),
})

type FormValues = z.infer<typeof onboardingSchema>

const DEFAULT_FORM_VALUES = (name = ""): Partial<FormValues> => ({
  orgName: name, slug: "", tenant_role: "", admin_full_name: "",
  admin_email: "", admin_password: "", plan_id: "",
})

const DEFAULT_REPLICATION_SETTINGS: ReplicationSettings = {
  extraction_fields: true,
  extraction_templates: true,
  tenant_configurations: true,
  organisation_configurations: true,
  tenant_profiles: true,
  organisation_profiles: true,
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  children?: React.ReactNode
  existingOrganization?: { id: string; name: string }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateOrganizationModal({ children, existingOrganization }: Props) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [createdTenant, setCreatedTenant] = useState<CreatedTenantState | null>(null)
  const [replicationSettings, setReplicationSettings] = useState<ReplicationSettings>(DEFAULT_REPLICATION_SETTINGS)

  const { data: organizations = [], isLoading: isOrgsLoading } = useOrganizations()
  const { data: plans, isLoading: isPlansLoading } = useQuery({ queryKey: ["plans"], queryFn: plansService.getAll })
  const { mutate: onboardTenant, isPending } = useOnboardOrganizationAndTenant()
  const { mutate: replicateMasterData, isPending: isReplicating } = useReplicateMasterData()

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES(existingOrganization?.name),
  })

  const { handleSubmit, reset, watch, setValue, formState: { isValid } } = formMethods

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const updateSearchParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams)
    value ? params.set(key, value) : params.delete(key)
    setSearchParams(params)
  }

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || isOrgsLoading || hasInitialized) return
    setHasInitialized(true)

    if (!isCreatingOrg) {
      if (existingOrganization) {
        setSelectedOrgId(existingOrganization.id)
        setValue("orgName", existingOrganization.name, { shouldValidate: true })
      } else {
        setSelectedOrgId("")
        setValue("orgName", "", { shouldValidate: true })
        updateSearchParam("org_id")
      }
    } else if (organizations.length === 0) {
      setIsCreatingOrg(true)
    }
  }, [isOpen, isOrgsLoading, hasInitialized])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setHasInitialized(false)
      setTimeout(() => {
        setIsCreatingPlan(false)
        setIsCreatingOrg(false)
        setCreatedTenant(null)
        setReplicationSettings({ ...DEFAULT_REPLICATION_SETTINGS })
        reset(DEFAULT_FORM_VALUES(existingOrganization?.name))
        updateSearchParam("org_id")
      }, 300)
    }
  }

  const handleToggleCreatingOrg = (create: boolean) => {
    setIsCreatingOrg(create)

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

  // ─── Render ───────────────────────────────────────────────────────────────

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
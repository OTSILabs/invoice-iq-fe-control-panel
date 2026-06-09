import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { useState, useEffect } from "react"
import { plansService } from "@/api/services/plans.service"
import { PlanForm } from "@/pages/plans/plan-form-dialog"
import { useQuery } from "@tanstack/react-query"
import { useOnboardOrganizationAndTenant, useReplicateMasterData, useOrganizations } from "@/api/hooks/useOrganizations"
import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "@/lib/toast"
import { InputField } from "../../../components/ui/input-field"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const onboardingSchema = z.object({
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
  admin_email: z.string().email("Please enter a valid email address."),
  admin_password: z.string().min(6, "Password must be at least 6 characters."),
  plan_id: z.string().optional(),
})

type FormValues = z.infer<typeof onboardingSchema>
type CreatedTenantState = {
  id: string
  orgId: string
  slug: string
}
const replicationOptions = [
  { key: "extraction_fileds", label: "Extraction Fields" },
  { key: "extraction_templates", label: "Extraction Templates" },
  { key: "tenant_confogurations", label: "Tenant Configurations" },
  { key: "organisation_configurations", label: "Organisation Configurations" },
  { key: "tenant_profiles", label: "Tenant Profiles" },
  { key: "organisation_profiles", label: "Organisation Profiles" },
] as const

type ReplicationOptionKey = (typeof replicationOptions)[number]["key"]


type ReplicationSettings = Record<ReplicationOptionKey, boolean>

const defaultReplicationSettings: ReplicationSettings = {
  extraction_fileds: true,
  extraction_templates: true,
  tenant_confogurations: true,
  organisation_configurations: true,
  tenant_profiles: true,
  organisation_profiles: true,
}

export function CreateOrganizationModal({
  children,
  existingOrganization,
}: {
  children?: React.ReactNode
  existingOrganization?: { id: string; name: string }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [createdTenant, setCreatedTenant] = useState<CreatedTenantState | null>(
    null
  )
  const [replicationSettings, setReplicationSettings] =
    useState<ReplicationSettings>(defaultReplicationSettings)

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreatingOrg, setIsCreatingOrg] = useState<boolean>(false)
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")

  const { data: organizations = [], isLoading: isOrgsLoading } = useOrganizations()

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: plansService.getAll,
  })

  const { mutate: onboardTenant, isPending } = useOnboardOrganizationAndTenant()
  const { mutate: replicateMasterData, isPending: isReplicating } = useReplicateMasterData()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      orgName: existingOrganization?.name || "",
      slug: "",
      tenant_role: "",
      admin_full_name: "",
      admin_email: "",
      admin_password: "",
      plan_id: "",
    },
  })

  useEffect(() => {
    if (isOpen && !isOrgsLoading) {
      if (!isCreatingOrg) {
        if (existingOrganization) {
          setSelectedOrgId(existingOrganization.id)
          setValue("orgName", existingOrganization.name, { shouldValidate: true })
        } else {
          setSelectedOrgId("")
          setValue("orgName", "", { shouldValidate: true })
          const params = new URLSearchParams(searchParams)
          params.delete("org_id")
          setSearchParams(params)
        }
      }
    } else if (isOpen && !isOrgsLoading && !existingOrganization && organizations.length === 0) {
      setIsCreatingOrg(true)
    }
  }, [isOpen, isOrgsLoading, organizations, existingOrganization])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(() => {
        setIsCreatingPlan(false)
        setIsCreatingOrg(false)
        setCreatedTenant(null)
        setReplicationSettings({ ...defaultReplicationSettings })
        reset({
          orgName: existingOrganization?.name || "",
          slug: "",
          tenant_role: "",
          admin_full_name: "",
          admin_email: "",
          admin_password: "",
          plan_id: "",
        })
        const params = new URLSearchParams(searchParams)
        params.delete("org_id")
        setSearchParams(params)
      }, 300)
    }
  }

  const handleToggleCreatingOrg = (create: boolean) => {
    setIsCreatingOrg(create)
    if (!create) {
      if (organizations.length > 0) {
        const currentId = selectedOrgId || ""
        setSelectedOrgId(currentId)
        const org = organizations.find((o) => o.id === currentId)
        if (org) {
          setValue("orgName", org.name, { shouldValidate: true })
          const params = new URLSearchParams(searchParams)
          params.set("org_id", currentId)
          setSearchParams(params)
        } else {
          setValue("orgName", "", { shouldValidate: true })
          const params = new URLSearchParams(searchParams)
          params.delete("org_id")
          setSearchParams(params)
        }
      } else {
        setValue("orgName", "", { shouldValidate: true })
      }
    } else {
      setValue("orgName", "", { shouldValidate: true })
      const params = new URLSearchParams(searchParams)
      params.delete("org_id")
      setSearchParams(params)
    }
  }

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSelectedOrgId(id)
    const org = organizations.find((o) => o.id === id)
    if (org) {
      setValue("orgName", org.name, { shouldValidate: true })
    }
    const params = new URLSearchParams(searchParams)
    params.set("org_id", id)
    setSearchParams(params)
  }

  const onSubmit = (data: FormValues, planIdOverride?: string) => {
    const finalPlanId = planIdOverride || data.plan_id
    if (!finalPlanId) {
      toast.error("Plan ID is required", "Plan ID is required to create a tenant.")
      return
    }

    const finalOrgId = existingOrganization?.id || (!isCreatingOrg ? selectedOrgId : undefined)

    onboardTenant(
      {
        orgName: data.orgName,
        slug: data.slug,
        tenant_role: data.tenant_role,
        admin_full_name: data.admin_full_name,
        admin_email: data.admin_email,
        admin_password: data.admin_password,
        plan_id: finalPlanId,
        existingOrgId: finalOrgId,
      },
      {
        onSuccess: (tenant) => {
          setCreatedTenant(tenant)
          toast.success("Tenant created successfully!")
        },
        onError: (error) => {
          toast.error(
            error,
            existingOrganization
              ? "Failed to add tenant. Please try again."
              : "Failed to create organization and tenant. Please try again."
          )
        },
      }
    )
  }

  const handleInlinePlanSuccess = (newPlan?: { id?: string } | null) => {
    setValue("plan_id", newPlan?.id || "")
    const values = watch()
    onSubmit(values, newPlan?.id || "")
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
        onError: (error) => {
          toast.error(
            error,
            "Failed to replicate master data. Please try again."
          )
        },
      }
    )
  }

  const isFormReadyToSubmit = isValid && (!!watch("plan_id") || isCreatingPlan)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        showCloseButton={!isReplicating}
        className={
          createdTenant
            ? "flex flex-col gap-6 overflow-hidden border-border bg-popover p-6 shadow-lg sm:max-w-md sm:rounded-xl"
            : "grid max-h-[86vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-border bg-popover p-0 shadow-lg sm:max-w-3xl sm:rounded-xl"
        }
      >
        {createdTenant ? (
          <>
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="flex size-14 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm animate-pulse duration-1500">
                <RefreshCw className="size-6 text-blue-600 animate-in zoom-in duration-300" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                  Confirm Replication
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Do you want to replicate master data for tenant <span className="font-semibold text-foreground">{createdTenant.slug}</span> now?
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Replication Items
                </span>
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <div className="grid gap-2 rounded-lg border border-border bg-background p-4 grid-cols-1">
                {replicationOptions.map((option) => (
                  <div
                    key={option.key}
                    className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-background/50 transition-colors"
                  >
                    <Checkbox
                      id={`replicate-${option.key}`}
                      checked={replicationSettings[option.key]}
                      disabled={isReplicating}
                      onCheckedChange={(checked) => {
                        setReplicationSettings((current) => ({
                          ...current,
                          [option.key]: checked === true,
                        }))
                      }}
                      className="size-4 rounded border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label
                      htmlFor={`replicate-${option.key}`}
                      className="text-xs font-medium leading-none text-foreground/80 cursor-pointer select-none"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full font-medium flex items-center justify-center gap-1.5"
                disabled={isReplicating}
                onClick={() => {
                  handleOpenChange(false)
                  toast.info("Onboarding completed", "You can replicate master data later.")
                  navigate(`/organizations/${createdTenant.orgId}`)
                }}
              >
                Skip for Now
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                size="sm"
                className="w-full font-medium bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-1.5"
                disabled={isReplicating}
                onClick={handleReplicateMasterData}
              >
                {isReplicating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Replicating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    Replicate Now
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="border-b border-border bg-popover px-8 py-6">
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

            <ScrollArea className="min-h-0 min-w-0 flex-1 bg-muted/10">
              <div className="p-6 md:p-8 space-y-8">
                <form
                  id="create-all-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit((d) => onSubmit(d))()
                  }}
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

     
     

      {/* Input field */}
      <div className="space-y-1">
        <label
          htmlFor={isCreatingOrg ? "orgName" : "existingOrgSelect"}
          className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
        >
          {existingOrganization
            ? "Organization"
            : isCreatingOrg
            ? "Organization name"
            : "Organization"}{" "}
          <span className="text-destructive">*</span>
        </label>

        {existingOrganization ? (
          <InputField id="orgName" disabled={true} {...register("orgName")} />
        ) : !isCreatingOrg ? (
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

            <option value="__create__">+ Create organization</option>
          </InputField>
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
                className="h-9 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleToggleCreatingOrg(false)}
              >
                Cancel
              </Button>
            </div>
            {errors.orgName && (
              <span className="px-0.5 text-[11px] font-medium text-destructive">
                {errors.orgName.message}
              </span>
            )}
          </>
        )}

        {existingOrganization && (
          <p className="text-[11px] text-muted-foreground">
            Adding tenant to pre-selected organization.
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
                            {errors.slug.message}
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
                            {errors.tenant_role.message}
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
                              {errors.admin_full_name.message}
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
                              {errors.admin_email.message}
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
                              {errors.admin_password.message}
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
                            type="button"
                            size="xs"
                            className="h-[26px] bg-muted hover:bg-muted/80 text-muted-foreground border-none font-bold text-[10px] px-2.5 rounded-full shadow-none cursor-pointer"
                            onClick={() => setIsCreatingPlan(false)}
                          >
                            <ArrowLeft className="mr-1 h-3 w-3" /> Select Plan
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="xs"
                            className="h-[26px] bg-primary/10 hover:bg-primary/20 text-primary border-none font-bold text-[10px] px-2.5 rounded-full shadow-none cursor-pointer"
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
                        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
                className="w-full px-3 font-medium bg-primary hover:bg-primary/90 text-white shadow-none sm:w-auto"
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
        )}
      </DialogContent>
    </Dialog>
  )
}

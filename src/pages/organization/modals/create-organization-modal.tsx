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
  ArrowRight
} from "lucide-react"
import { useState } from "react"
import { organizationsService } from "@/api/services/organizations.service"
import { plansService } from "@/api/services/plans.service"
import { PlanForm } from "@/pages/plans/plan-form-dialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const getString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined
}

const getTenantIdFromResponse = (response: unknown): string | undefined => {
  if (!isRecord(response)) return undefined

  const tenant = response.tenant
  const data = response.data

  return (
    getString(response.id) ||
    getString(response.tenant_id) ||
    (isRecord(tenant) ? getString(tenant.id) : undefined) ||
    (isRecord(data)
      ? getString(data.id) || getString(data.tenant_id)
      : undefined)
  )
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!isRecord(error)) return fallback

  const response = error.response
  const data = isRecord(response) ? response.data : undefined
  const detail = isRecord(data) ? data.detail : undefined

  return (
    (isRecord(data) ? getString(data.message) : undefined) ||
    getString(detail) ||
    getString(error.message) ||
    fallback
  )
}

export function CreateOrganizationModal({
  children,
  existingOrganization,
}: {
  children?: React.ReactNode
  existingOrganization?: { id: string; name: string }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isReplicating, setIsReplicating] = useState(false)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [createdTenant, setCreatedTenant] = useState<CreatedTenantState | null>(
    null
  )
  const [replicationSettings, setReplicationSettings] =
    useState<ReplicationSettings>(defaultReplicationSettings)
  const queryClient = useQueryClient()

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: plansService.getAll,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    // trigger,
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(() => {
        setIsCreatingPlan(false)
        setCreatedTenant(null)
        setIsReplicating(false)
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
      }, 300)
    }
  }

  // const handleCreateOrganizationOnly = async () => {
  //   const isValidOrg = await trigger("orgName");
  //   if (!isValidOrg) return;

  //   const orgName = watch("orgName");
  //   setIsPending(true)
  //   try {
  //     await organizationsService.create({ name: orgName })
  //     queryClient.invalidateQueries({ queryKey: ['organizations'] })
  //     setIsOpen(false)
  //     toast.success("Organization created successfully!")
  //   } catch (error) {
  //     console.error("Failed to create organization:", error)
  //     toast.error("Failed to create organization. Please try again.")
  //   } finally {
  //     setIsPending(false)
  //   }
  // }

  const onSubmit = async (data: FormValues, planIdOverride?: string) => {
    setIsPending(true)
    try {
      let orgId = existingOrganization?.id
      if (!orgId) {
        const createdOrg = await organizationsService.create({
          name: data.orgName,
        })
        orgId = createdOrg.id
      }

      const finalPlanId = planIdOverride || data.plan_id
      if (!finalPlanId) {
        throw new Error("Plan ID is required to create a tenant.")
      }

      const tenantPayloadData = {
        organization_id: orgId,
        slug: data.slug.replace(/-/g, ""),
        tenant_role: data.tenant_role,
        configurations: {
          display_name: data.slug.replace(/-/g, " "),
          max_number_of_invoices: "96000",
          reporting_currency: "INR",
          timezone: "IST",
        },
        profile: {
          display_name: data.admin_full_name,
          domain_name:
            data.slug.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
          reporting_currency: "INR",
          timezone: "IST",
        },
        plan_id: finalPlanId,
        plan_valid_from: new Date().toISOString(),
        admin_user: {
          email: data.admin_email,
          password: data.admin_password,
          full_name: data.admin_full_name,
        },
        requested_by: data.admin_email || "system",
      }

      const tenant = await organizationsService.createTenant(
        orgId,
        tenantPayloadData
      )
      const tenantId = getTenantIdFromResponse(tenant)

      if (!tenantId) {
        throw new Error(
          "Tenant was created, but the tenant ID was not returned for replication."
        )
      }

      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      queryClient.invalidateQueries({
        queryKey: ["organizations", orgId, "tenants"],
      })

      setCreatedTenant({
        id: tenantId,
        orgId,
        slug: data.slug,
      })
    } catch (error: unknown) {
      console.error("Failed to create organization and tenant:", error)
      toast.error(
        getErrorMessage(
          error,
          existingOrganization
            ? "Failed to add tenant. Please try again."
            : "Failed to create organization and tenant. Please try again."
        )
      )
    } finally {
      setIsPending(false)
    }
  }

  const handleInlinePlanSuccess = (newPlan?: { id?: string } | null) => {
    setValue("plan_id", newPlan?.id || "")
    const values = watch()
    onSubmit(values, newPlan?.id || "")
  }

  const handleReplicateMasterData = async () => {
    if (!createdTenant) return

    setIsReplicating(true)
    try {
      await organizationsService.replicateMasterData(
        createdTenant.id,
        replicationSettings
      )
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      queryClient.invalidateQueries({
        queryKey: ["organizations", createdTenant.orgId, "tenants"],
      })
      handleOpenChange(false)
      toast.success("Success", {
        description: "Tenant Onboarded Successfully",
      })
    } catch (error: unknown) {
      console.error("Failed to replicate master data:", error)
      toast.error(
        getErrorMessage(
          error,
          "Failed to replicate master data. Please try again."
        )
      )
    } finally {
      setIsReplicating(false)
    }
  }

  const isFormReadyToSubmit = isValid && (!!watch("plan_id") || isCreatingPlan)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        showCloseButton={!isReplicating}
        onPointerDownOutside={(e) => {
          if (!isReplicating) {
            handleOpenChange(false)
          } else {
            e.preventDefault()
          }
        }}
        onInteractOutside={(e) => {
          if (!isReplicating) {
            handleOpenChange(false)
          } else {
            e.preventDefault()
          }
        }}
        className={
          createdTenant
            ? "flex flex-col gap-6 overflow-hidden border-border bg-background p-6 shadow-lg sm:max-w-md sm:rounded-xl"
            : "grid max-h-[86vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-border bg-background p-0 shadow-lg sm:max-w-3xl sm:rounded-xl"
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
                  toast.info("Onboarding completed", {
                    description: "You can replicate master data later."
                  })
                }}
              >
                Skip for Now
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                size="sm"
                className="w-full font-medium bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5"
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
            <DialogHeader className="border-b border-border bg-background px-8 py-6">
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
              <div className="p-6 md:p-8">
                <form
                  id="create-all-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!isCreatingPlan) handleSubmit((d) => onSubmit(d))()
                  }}
                  className="space-y-10"
                >
                  {/* Organization Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-1 text-base font-bold text-foreground">
                        1. Organization Details
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Enter the primary details for the new organization.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <InputField
                        id="orgName"
                        label={
                          <>
                            Organization Name{" "}
                            <span className="text-destructive">*</span>
                          </>
                        }
                        placeholder="e.g. Acme Corp"
                        disabled={!!existingOrganization}
                        {...register("orgName")}
                      />
                      {errors.orgName && (
                        <span className="px-1 text-[11px] font-medium text-destructive">
                          {errors.orgName.message}
                        </span>
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
                          placeholder="admin"
                          {...register("tenant_role")}
                        />
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
                          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Select Plan <span className="text-destructive">*</span>
                        </label>
                        {!isCreatingPlan && (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-8 px-2 text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                              setValue("plan_id", "")
                              setIsCreatingPlan(true)
                            }}
                          >
                            <Plus className="mr-1 h-4 w-4" /> Add Plan
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

                    {isCreatingPlan && (
                      <div className="mt-8 animate-in border-t border-border pt-6 duration-300 fade-in slide-in-from-bottom-4">
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
                </form>
              </div>
            </ScrollArea>

            <DialogFooter className="flex flex-col-reverse gap-3 border-t border-border bg-background px-8 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <div className="mt-2 w-full sm:mt-0 sm:w-auto"></div>
              <Button
                type="submit"
                size={"sm"}
                form={isCreatingPlan ? "inline-plan-form" : "create-all-form"}
                className="w-full px-3 font-medium shadow-none sm:w-auto"
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

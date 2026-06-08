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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Minus, Plus } from "lucide-react"
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
  orgName: z.string().min(2, "Organization name must be at least 2 characters."),
  slug: z.string().min(2, "Slug is required.").regex(/^[a-zA-Z0-9-]+$/, "Slug can only contain letters, numbers, and hyphens."),
  tenant_role: z.string().min(1, "Tenant role is required."),
  admin_full_name: z.string().min(1, "Full name is required."),
  admin_email: z.string().email("Please enter a valid email address."),
  admin_password: z.string().min(6, "Password must be at least 6 characters."),
  plan_id: z.string().optional(),
})

type FormValues = z.infer<typeof onboardingSchema>

export function CreateOrganizationModal({ 
  children,
  existingOrganization
}: { 
  children?: React.ReactNode,
  existingOrganization?: { id: string; name: string }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const queryClient = useQueryClient()
  
  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: plansService.getAll
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    // trigger,
    formState: { errors, isValid }
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
    }
  })

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(() => {
        setIsCreatingPlan(false)
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
      let orgId = existingOrganization?.id;
      if (!orgId) {
        const createdOrg = await organizationsService.create({ name: data.orgName })
        orgId = createdOrg.id;
      }
      
      const finalPlanId = planIdOverride || data.plan_id;
      if (!finalPlanId) {
        throw new Error("Plan ID is required to create a tenant.");
      }

      const tenantPayloadData = {
        organization_id: orgId,
        slug: data.slug.replace(/-/g, ''),
        tenant_role: data.tenant_role,
        configurations: {
          display_name: data.slug.replace(/-/g, ' '),
          max_number_of_invoices: "96000",
          reporting_currency: "INR",
          timezone: "IST"
        },
        profile: {
          display_name: data.admin_full_name,
          domain_name: data.slug.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com",
          reporting_currency: "INR",
          timezone: "IST"
        },
        plan_id: finalPlanId,
        plan_valid_from: new Date().toISOString(),
        plan_valid_to: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        admin_user: {
          email: data.admin_email,
          password: data.admin_password,
          full_name: data.admin_full_name
        },
        requested_by: data.admin_email || "system"
      };

      await organizationsService.createTenant(orgId, tenantPayloadData)

      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      
      setIsOpen(false)
      toast.success(existingOrganization ? "Tenant added successfully!" : "Organization and Tenant created successfully!")
    } catch (error: any) {
      console.error("Failed to create organization and tenant:", error)
      toast.error(error?.message || (existingOrganization ? "Failed to add tenant. Please try again." : "Failed to create organization and tenant. Please try again."))
    } finally {
      setIsPending(false)
    }
  }

  const handleInlinePlanSuccess = (newPlan: any) => {
    setValue("plan_id", newPlan?.id || "");
    const values = watch();
    onSubmit(values, newPlan?.id || "");
  };

  const isFormReadyToSubmit = isValid && (!!watch("plan_id") || isCreatingPlan);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        className="grid max-h-[86vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0 sm:max-w-3xl gap-0 border-border bg-background shadow-lg sm:rounded-xl font-sans"
      >
        <DialogHeader className="border-b border-border px-8 py-6 bg-background">
          <div className="max-w-2xl">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {existingOrganization ? "Add Tenant to Organization" : "Welcome! Let's get started"}
            </DialogTitle>
            <DialogDescription className="text-sm  text-muted-foreground">
              {existingOrganization 
                ? "Configure tenant details and select a billing plan for this organization."
                : "Follow this onboarding process to set up your new organization and tenant."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 min-w-0 bg-muted/10">
          <div className="p-6 md:p-8">
            <form id="create-all-form" onSubmit={(e) => { e.preventDefault(); if(!isCreatingPlan) handleSubmit((d) => onSubmit(d))(); }} className="space-y-10 ">
              
              {/* Organization Section */}
              <div className="space-y-4 ">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">1. Organization Details</h3>
                  <p className="text-xs text-muted-foreground">Enter the primary details for the new organization.</p>
                </div>
                <div className="space-y-1">
                  <InputField
                    id="orgName" 
                    label={<>Organization Name <span className="text-destructive">*</span></>}
                    placeholder="e.g. Acme Corp" 
                    disabled={!!existingOrganization}
                    {...register("orgName")}
                  />
                  {errors.orgName && <span className="text-[11px] font-medium text-destructive px-1">{errors.orgName.message}</span>}
                </div>
              </div>

              {/* Tenant Section */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">2. Tenant Configuration</h3>
                  <p className="text-sm text-muted-foreground">Configure the technical and administrative settings.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <InputField id="slug" label="Tenant Slug" placeholder="acme-corp" {...register("slug")} />
                    {errors.slug && <span className="text-[11px] font-medium text-destructive px-1">{errors.slug.message}</span>}
                  </div>
                  <div className="space-y-1">
                    <InputField id="role" label="Tenant Role" placeholder="admin" {...register("tenant_role")} />
                    {errors.tenant_role && <span className="text-[11px] font-medium text-destructive px-1">{errors.tenant_role.message}</span>}
                  </div>
                </div>
                <div className="pt-4">
                  <h4 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Admin User Details</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <InputField id="adminName" label="Full Name" placeholder="e.g. John Doe" {...register("admin_full_name")} />
                      {errors.admin_full_name && <span className="text-[11px] font-medium text-destructive px-1">{errors.admin_full_name.message}</span>}
                    </div>
                    <div className="space-y-1">
                      <InputField id="adminEmail" label="Email Address" type="email" placeholder="john@example.com" {...register("admin_email")} />
                      {errors.admin_email && <span className="text-[11px] font-medium text-destructive px-1">{errors.admin_email.message}</span>}
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <InputField id="adminPass" label="Temporary Password" type="password" placeholder="Enter a secure password" {...register("admin_password")} />
                      {errors.admin_password && <span className="text-[11px] font-medium text-destructive px-1">{errors.admin_password.message}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Section */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">3. Plan Selection</h3>
                  <p className="text-sm text-muted-foreground">Choose a billing tier for this organization.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="planSelect" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Select Plan <span className="text-destructive">*</span>
                    </label>
                    {!isCreatingPlan && (
                      <Button type="button" variant="link" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10 px-2" onClick={() => {
                        setValue("plan_id", "");
                        setIsCreatingPlan(true);
                      }}>
                        <Plus className="h-4 w-4 mr-1" /> Add Plan
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
                    {plans?.map((plan: any) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.description}
                      </option>
                    ))}
                  </InputField>
                </div>

                {isCreatingPlan && (
                  <div className="mt-8 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-1">Create New Plan</h4>
                        <p className="text-xs text-muted-foreground">Add a new plan to the system. It will be automatically available to select once created.</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setIsCreatingPlan(false)}>
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

        <DialogFooter className="border-t border-border bg-background px-8 py-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="w-full sm:w-auto mt-2 sm:mt-0">
          </div>
          <Button 
            type="submit"
            size={"sm"} 
            form={isCreatingPlan ? "inline-plan-form" : "create-all-form"} 
            className="w-full sm:w-auto font-medium px-3 shadow-none"
            disabled={isPending || (!isCreatingPlan && !isFormReadyToSubmit)}
          >
            {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
            {existingOrganization ? "Create Tenant" : "Create Tenant"}
          </Button>
           {/* chnage like this  <Button 
            type="submit" 
            form={isCreatingPlan ? "inline-plan-form" : "create-all-form"} 
            className="w-full sm:w-auto font-medium px-3 shadow-none"
            disabled={isPending || (!isCreatingPlan && !isFormReadyToSubmit)}
          >
            {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
            {existingOrganization ? "Create Tenant" : "Create Tenant"}
          </Button>   */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

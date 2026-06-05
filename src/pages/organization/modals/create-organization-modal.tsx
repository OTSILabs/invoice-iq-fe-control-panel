import { useState } from "react"
import { Plus, Loader2, Minus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputField } from "../../../components/ui/input-field"
import { PlanForm } from "@/pages/plans/plan-form-dialog"
import { organizationsService } from "@/api/services/organizations.service"
import { plansService } from "@/api/services/plans.service"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export function CreateOrganizationModal({ 
  children,
  existingOrganization
}: { 
  children?: React.ReactNode,
  existingOrganization?: { id: string; name: string }
}) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
    const queryClient = useQueryClient()
  
  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: plansService.getAll
  })
  
  const [orgPayload, setOrgPayload] = useState({
    name: existingOrganization?.name || ""
  })
  
  const [tenantPayload, setTenantPayload] = useState({
    slug: "",
    tenant_role: "",
    admin_user: {
      email: "",
      password: "",
      full_name: ""
    }
  })

  const [planPayload, setPlanPayload] = useState({
    plan_id: ""
  })

  const STEPS = [
    { title: "Organization Info", id: "org" },
    { title: "Tenant Config", id: "tenant" },
    { title: "Plan Selection", id: "plan" }
  ]

  const handleNextStep = () => {
    if (activeStepIndex < STEPS.length - 1) {
      setActiveStepIndex(prev => prev + 1)
    }
  }

  const handlePreviousStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1)
    }
  }

  const handleStepChange = (index: number) => {
    setActiveStepIndex(index)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset state when closed after animation
      setTimeout(() => {
        setActiveStepIndex(0)
        setIsCreatingPlan(false)
        setOrgPayload({ name: existingOrganization?.name || "" })
        setTenantPayload({
          slug: "",
          tenant_role: "",
          admin_user: {
            email: "",
            password: "",
            full_name: ""
          }
        })
        setPlanPayload({ plan_id: "" })
      }, 300)
    }
  }

  const handleCreateOrganizationOnly = async () => {
    setIsPending(true)
    try {
      await organizationsService.create({ name: orgPayload.name })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setIsOpen(false)
      setActiveStepIndex(0)
      setOrgPayload({ name: existingOrganization?.name || "" })
      toast.success("Organization created successfully!")
    } catch (error) {
      console.error("Failed to create organization:", error)
      toast.error("Failed to create organization. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  const handleFinalSubmit = async (planIdOverride?: string) => {
    setIsPending(true)
    try {
      // 1. Get or Create the Organization
      let orgId = existingOrganization?.id;
      if (!orgId) {
        const createdOrg = await organizationsService.create({ name: orgPayload.name })
        orgId = createdOrg.id;
      }
      
      // 2. Build the payload for creating the Tenant, including the new Organization ID
      // If planIdOverride is provided (from the newly created plan), use it. 
      // Otherwise use the selected plan from the dropdown.
      const finalPlanId = planIdOverride || planPayload.plan_id;
      
      if (!finalPlanId) {
        throw new Error("Plan ID is required to create a tenant.");
      }

      const tenantPayloadData = {
        organization_id: orgId,
        slug: tenantPayload.slug.replace(/-/g, ''),
        tenant_role: tenantPayload.tenant_role,
        configurations: {
          display_name: tenantPayload.slug.replace(/-/g, ' '),
          max_number_of_invoices: "96000",
          reporting_currency: "INR",
          timezone: "IST"
        },
        profile: {
          display_name: tenantPayload.admin_user.full_name,
          domain_name: tenantPayload.slug.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com",
          reporting_currency: "INR",
          timezone: "IST"
        },
        plan_id: finalPlanId,
        plan_valid_from: new Date().toISOString(),
        plan_valid_to: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        admin_user: tenantPayload.admin_user,
        requested_by: tenantPayload.admin_user.email || "system"
      };

      // 3. Create the Tenant (this will also create the admin_user if the backend logic handles it)
      await organizationsService.createTenant(orgId, tenantPayloadData)

      // Invalidate the cache to trigger a re-fetch of the organizations list
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      
      setIsOpen(false)
      setActiveStepIndex(0)
      setOrgPayload({ name: existingOrganization?.name || "" })
      setTenantPayload({
        slug: "",
        tenant_role: "",
        admin_user: {
          email: "",
          password: "",
          full_name: ""
        }
      })
      setPlanPayload({ plan_id: "" })
      
      toast.success(existingOrganization ? "Tenant added successfully!" : "Organization and Tenant created successfully!")
    } catch (error: any) {
      console.error("Failed to create organization and tenant:", error)
      toast.error(error?.message || (existingOrganization ? "Failed to add tenant. Please try again." : "Failed to create organization and tenant. Please try again."))
    } finally {
      setIsPending(false)
    }
  }

  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === STEPS.length - 1;
  const isFormReadyToSubmit = orgPayload.name.trim().length > 0;

  const canProceedToNext = () => {
    if (activeStepIndex === 0) return orgPayload.name.trim().length > 0;
    return true;
  }

  const isStepAccessible = (index: number) => {
    if (index === 0) return true;
    if (index === 1) return orgPayload.name.trim().length > 0;
    return true;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        className="grid max-h-[86vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0 sm:max-w-4xl gap-0 !rounded-md !shadow-none"
      >
        <DialogHeader className="border-b px-5 py-4 bg-white">
          <div className="max-w-2xl">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
              {existingOrganization ? "Add Tenant" : "Create Organization"}
            </DialogTitle>
            <DialogDescription className="text-sm mt-1 text-slate-500">
              {existingOrganization 
                ? "Configure tenant details and select a billing plan for this organization."
                : "Set up a new organization, configure its tenant details, and select a billing plan."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="min-h-[28rem] overflow-hidden bg-slate-50">
          <div className="grid h-full min-h-0 md:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="overflow-hidden border-b bg-white p-4 md:border-b-0 md:border-r border-slate-200">
              <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
                {STEPS.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  return (
                    <button
                      key={step.title}
                      type="button"
                      disabled={!isStepAccessible(index)}
                      className={cn(
                        "flex min-w-40 items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors md:min-w-0 font-medium",
                        isActive
                          ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                      onClick={() => handleStepChange(index)}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                          isActive
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white text-slate-500",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0">{step.title}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <ScrollArea className="h-full min-h-0 min-w-0 bg-white">
              <div className="p-6 md:p-8">
                {activeStepIndex === 0 && (
                  <form id="org-form" onSubmit={(e) => { e.preventDefault(); if(canProceedToNext()) handleNextStep(); }} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Organization Info</h3>
                      <p className="text-sm text-slate-500 mb-6">Enter the primary details for the new organization.</p>
                    </div> */}
                    <InputField
                      id="orgName" 
                      label={<>Organization Name <span className="text-red-500">*</span></>}
                      placeholder="e.g. Acme Corp" 
                      value={orgPayload.name}
                      onChange={(e: any) => setOrgPayload({...orgPayload, name: e.target.value})}
                      disabled={!!existingOrganization}
                    />
                  </form>
                )}

                {activeStepIndex === 1 && (
                  <form id="tenant-form" onSubmit={(e) => { e.preventDefault(); if(canProceedToNext()) handleNextStep(); }} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Tenant Configuration</h3>
                      <p className="text-sm text-slate-500 mb-6">Configure the technical and administrative settings.</p>
                    </div> */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputField id="slug" label="Tenant Slug" placeholder="acme-corp" value={tenantPayload.slug} onChange={(e: any) => setTenantPayload({...tenantPayload, slug: e.target.value})} />
                      <InputField id="role" label="Tenant Role" placeholder="admin" value={tenantPayload.tenant_role} onChange={(e: any) => setTenantPayload({...tenantPayload, tenant_role: e.target.value})} />
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-slate-500">Admin User Details</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <InputField id="adminName" label="Full Name" value={tenantPayload.admin_user.full_name} onChange={(e: any) => setTenantPayload({...tenantPayload, admin_user: {...tenantPayload.admin_user, full_name: e.target.value}})} />
                        <InputField id="adminEmail" label="Email Address" type="email" value={tenantPayload.admin_user.email} onChange={(e: any) => setTenantPayload({...tenantPayload, admin_user: {...tenantPayload.admin_user, email: e.target.value}})} />
                        <InputField id="adminPass" label="Temporary Password" type="password" containerClassName="sm:col-span-2" value={tenantPayload.admin_user.password} onChange={(e: any) => setTenantPayload({...tenantPayload, admin_user: {...tenantPayload.admin_user, password: e.target.value}})} />
                      </div>
                    </div>
                 
                  </form>
                )}

                {activeStepIndex === 2 && (
                  <>
                    <form id="plan-form" onSubmit={(e) => { e.preventDefault(); if(isFormReadyToSubmit && !isCreatingPlan) handleFinalSubmit(); }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      {/* <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Plan Selection</h3>
                        <p className="text-sm text-slate-500 mb-6">Choose a billing tier for this organization.</p>
                      </div> */}
                      <Field>
                        <div className="flex items-center justify-between mb-2">
                          <FieldLabel htmlFor="planSelect" className="mb-0">Select Plan <span className="text-red-500">*</span></FieldLabel>
                          {!isCreatingPlan && (
                            <Button type="button" variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2" onClick={() => {
                              setPlanPayload({ plan_id: "" });
                              setIsCreatingPlan(true);
                            }}>
                              <Plus className="h-4 w-4 mr-1" /> Add Plan
                            </Button>
                          )}
                        </div>
                        <Select value={planPayload.plan_id} onValueChange={(val: string) => setPlanPayload({ plan_id: val })} disabled={isCreatingPlan}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={isPlansLoading ? "Loading plans..." : "Select a plan"} />
                          </SelectTrigger>
                          <SelectContent>
                            {plans?.map((plan: any) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </form>

                    {isCreatingPlan && (
                      <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Create New Plan</h4>
                            <p className="text-xs text-slate-500">Add a new plan to the system. It will be automatically available to select once created.</p>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600" onClick={() => setIsCreatingPlan(false)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        <PlanForm 
                          formId="inline-plan-form"
                          showFooter={false}
                          onCancel={() => setIsCreatingPlan(false)} 
                          onSuccess={(newPlan) => {
                            setPlanPayload({ plan_id: newPlan?.id || "" });
                            handleFinalSubmit(newPlan?.id || "");
                          }} 
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="border-t bg-white px-5 py-3.5">
          {!isFirstStep && (
            <Button 
              type="button" 
              variant="outline" 
              disabled={isPending} 
              onClick={() => isCreatingPlan ? setIsCreatingPlan(false) : handlePreviousStep()} 
              className="rounded-md px-5 font-medium shadow-sm"
            >
              Back
            </Button>
          )}
          {isFirstStep && !existingOrganization && (
            <Button type="button" className="bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 shadow-sm rounded-md px-5 font-medium" onClick={handleCreateOrganizationOnly} disabled={!canProceedToNext()}>
              {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
              Create Organization Only
            </Button>
          )}
          <Button 
            type="submit" 
            form={activeStepIndex === 0 ? "org-form" : activeStepIndex === 1 ? "tenant-form" : (isCreatingPlan ? "inline-plan-form" : "plan-form")} 
            variant="outline" 
            className={cn("rounded-md px-5 font-medium shadow-sm", isLastStep || isFirstStep ? "bg-blue-600 hover:bg-blue-700 text-white hover:text-white" : "")}
            disabled={isPending}
          >
            {isPending && isLastStep ? <Loader2 className="size-4 animate-spin mr-2" /> : (isLastStep ? <Plus className="size-4 mr-2" /> : null)}
            {isLastStep ? (existingOrganization ? "Create Tenant" : "Create Organization & Tenant") : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

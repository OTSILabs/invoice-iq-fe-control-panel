import { useState } from "react"
import { Plus, Save, Loader2, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { InputField } from "./ui/input-field"
import { organizationsService } from "@/api/services/organizations.service"
import { plansService } from "@/api/services/plans.service"
import { useQueryClient, useQuery } from "@tanstack/react-query"

export function CreateOrganizationModal({ children }: { children?: React.ReactNode }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  
  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: plansService.getAll
  })
  
  const [orgPayload, setOrgPayload] = useState({
    name: ""
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

  const handleCreateOrganizationOnly = async () => {
    setIsPending(true)
    try {
      await organizationsService.create({ name: orgPayload.name })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setIsOpen(false)
      setActiveStepIndex(0)
      setOrgPayload({ name: "" })
    } catch (error) {
      console.error("Failed to create organization:", error)
    } finally {
      setIsPending(false)
    }
  }

  const handleFinalSubmit = async () => {
    setIsPending(true)
    try {
      // 1. Create the Organization internally first
      const createdOrg = await organizationsService.create({ name: orgPayload.name })
      
      // 2. Build the payload for creating the Tenant, including the new Organization ID
      const tenantPayloadData = {
        organization_id: createdOrg.id,
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
        plan_id: planPayload.plan_id,
        plan_valid_from: new Date().toISOString(),
        plan_valid_to: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        admin_user: tenantPayload.admin_user,
        requested_by: tenantPayload.admin_user.email || "system"
      };

      // 3. Create the Tenant
      await organizationsService.createTenant(createdOrg.id, tenantPayloadData)

      // Invalidate the cache to trigger a re-fetch of the organizations list
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      
      setIsOpen(false)
      setActiveStepIndex(0)
      setOrgPayload({ name: "" })
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
    } catch (error) {
      console.error("Failed to create organization and tenant:", error)
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        className="grid max-h-[86vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0 sm:max-w-4xl gap-0 !rounded-md !shadow-none"
      >
        <DialogHeader className="border-b px-5 py-4 bg-white">
          <div className="max-w-2xl">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">Create Organization</DialogTitle>
            <DialogDescription className="text-sm mt-1 text-slate-500">
              Set up a new organization, configure its tenant details, and select a billing plan.
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
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Organization Info</h3>
                      <p className="text-sm text-slate-500 mb-6">Enter the primary details for the new organization.</p>
                    </div>
                    <InputField
                      id="orgName" 
                      label={<>Organization Name <span className="text-red-500">*</span></>}
                      placeholder="e.g. Acme Corp" 
                      value={orgPayload.name}
                      onChange={(e: any) => setOrgPayload({...orgPayload, name: e.target.value})}
                    />
                  </form>
                )}

                {activeStepIndex === 1 && (
                  <form id="tenant-form" onSubmit={(e) => { e.preventDefault(); if(canProceedToNext()) handleNextStep(); }} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Tenant Configuration</h3>
                      <p className="text-sm text-slate-500 mb-6">Configure the technical and administrative settings.</p>
                    </div>
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
                  <form id="plan-form" onSubmit={(e) => { e.preventDefault(); if(isFormReadyToSubmit) handleFinalSubmit(); }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Plan Selection</h3>
                      <p className="text-sm text-slate-500 mb-6">Choose a billing tier for this organization.</p>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="planSelect">Select Plan <span className="text-red-500">*</span></FieldLabel>
                      <Select value={planPayload.plan_id} onValueChange={(val: string) => setPlanPayload({ plan_id: val })}>
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
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="border-t bg-white px-5 py-3.5">
          {!isFirstStep && (
            <Button type="button" variant="outline" disabled={isPending} onClick={handlePreviousStep} className="rounded-md px-5 font-medium shadow-sm">
              Back
            </Button>
          )}
          {isFirstStep && (
            <Button type="button" className="bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 shadow-sm rounded-md px-5 font-medium" onClick={handleCreateOrganizationOnly} disabled={!canProceedToNext()}>
              {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
              Create Organization Only
            </Button>
          )}
          <Button type="submit" form={activeStepIndex === 0 ? "org-form" : activeStepIndex === 1 ? "tenant-form" : "plan-form"} variant="outline" className={cn("rounded-md px-5 font-medium shadow-sm", isLastStep || isFirstStep ? "bg-blue-600 hover:bg-blue-700 text-white hover:text-white" : "")}>
            {isPending && isLastStep ? <Loader2 className="size-4 animate-spin mr-2" /> : (isLastStep ? <Plus className="size-4 mr-2" /> : null)}
            {isLastStep ? "Create Organization & Tenant" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

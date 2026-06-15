import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { plansService } from "@/api/services/plans.service"
import { organizationsService } from "@/api/services/organizations.service"
import { toast } from "sonner"
import type { Tenant, Plan } from "@/types"

interface AssignPlanDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
  orgId?: string;
}

export function AssignPlanDialog({ tenant, onClose, onSuccess, orgId }: AssignPlanDialogProps) {
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState(tenant?.effective_plan_id || "");
  const [validFrom, setValidFrom] = useState(
    tenant?.effective_plan_valid_from ? new Date(tenant.effective_plan_valid_from).toISOString().split("T")[0] : ""
  );
  const [validTo, setValidTo] = useState(
    tenant?.effective_plan_valid_to ? new Date(tenant.effective_plan_valid_to).toISOString().split("T")[0] : ""
  );
  const [reason, setReason] = useState("");

  const { data: plans = [], isLoading: isPlansLoading } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: plansService.getAll,
    enabled: !!tenant,
  });

  const assignPlanMutation = useMutation({
    mutationFn: (payload: { plan_id: string; valid_from: string; valid_to: string; reason: string }) =>
      organizationsService.assignPlan(tenant!.id, payload),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ["organizations", orgId, "tenants"] });
      }
      toast.success("Subscription plan assigned successfully");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to assign plan");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }
    if (!validFrom) {
      toast.error("Valid From date is required");
      return;
    }
    if (!validTo) {
      toast.error("Valid To date is required");
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason for plan assignment is required");
      return;
    }

    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);

    if (fromDate >= toDate) {
      toast.error("Valid From date must be before Valid To date");
      return;
    }

    const payload = {
      plan_id: selectedPlanId,
      valid_from: fromDate.toISOString(),
      valid_to: toDate.toISOString(),
      reason: reason.trim(),
    };

    assignPlanMutation.mutate(payload);
  };

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Subscription Plan</DialogTitle>
            <DialogDescription>
              Assign or change the billing plan for tenant <strong>{tenant?.profile?.display_name || tenant?.slug || tenant?.id}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="plan-select">Select Plan <span className="text-red-500">*</span></Label>
              {isPlansLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground h-9">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading plans...
                </div>
              ) : (
                <NativeSelect
                  id="plan-select"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full"
                >
                  <NativeSelectOption value="">Select a subscription plan</NativeSelectOption>
                  {plans
                    .filter((p) => p.is_active)
                    .map((plan) => (
                      <NativeSelectOption key={plan.id} value={plan.id}>
                        {plan.description} ({plan.price_per_invoice_amount} {plan.price_per_invoice_currency}/invoice)
                      </NativeSelectOption>
                    ))}
                </NativeSelect>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason-input">Reason for Assignment <span className="text-red-500">*</span></Label>
              <Input
                id="reason-input"
                placeholder="e.g. Upgraded to premium, renewal, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid-from">Valid From <span className="text-red-500">*</span></Label>
                <Input
                  id="valid-from"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid-to">Valid To <span className="text-red-500">*</span></Label>
                <Input
                  id="valid-to"
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={assignPlanMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignPlanMutation.isPending || !selectedPlanId || !validFrom || !validTo || !reason.trim()}
            >
              {assignPlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

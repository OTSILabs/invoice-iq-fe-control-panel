import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { organizationsService } from "@/api/services/organizations.service"
import { toast } from "sonner"
import type { Tenant } from "@/types"

interface UnblockTenantDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
  orgId?: string;
}

export function UnblockTenantDialog({ tenant, onClose, onSuccess, orgId }: UnblockTenantDialogProps) {
  const queryClient = useQueryClient();
  const [governanceReason, setGovernanceReason] = useState("");

  useEffect(() => {
    if (tenant) {
      setGovernanceReason("");
    }
  }, [tenant]);

  const unblockMutation = useMutation({
    mutationFn: (data: { tenantId: string, outcome: string }) => organizationsService.unblockTenant(data.tenantId, data.outcome),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'tenants'] });
      }
      toast.success("Tenant unblocked successfully");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unblock tenant");
    }
  });

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setGovernanceReason("");
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unblock Tenant</DialogTitle>
          <DialogDescription>
            You are about to unblock the tenant <strong>{tenant?.tenant_admin_full_name || tenant?.id}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-slate-600">
            Unblocking this tenant will restore their ability to interact with the platform. You must provide a reason for this governance action.
          </p>
          <div className="space-y-2">
            <Label htmlFor="unblock-reason">Reason for unblocking <span className="text-red-500">*</span></Label>
            <Input 
              id="unblock-reason"
              placeholder="Enter outcome/reason" 
              value={governanceReason}
              onChange={(e) => setGovernanceReason(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onClose();
            setGovernanceReason("");
          }} disabled={unblockMutation.isPending}>
            Cancel
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            onClick={() => {
              if (tenant && governanceReason.trim()) {
                unblockMutation.mutate({ tenantId: tenant.id, outcome: governanceReason.trim() });
              }
            }}
            disabled={unblockMutation.isPending || !governanceReason.trim()}
          >
            {unblockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Unblock Tenant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

interface BlockTenantDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
  orgId?: string;
}

export function BlockTenantDialog({ tenant, onClose, onSuccess, orgId }: BlockTenantDialogProps) {
  const queryClient = useQueryClient();
  const [governanceReason, setGovernanceReason] = useState("");

  useEffect(() => {
    if (tenant) {
      setGovernanceReason("");
    }
  }, [tenant]);

  const blockMutation = useMutation({
    mutationFn: (data: { tenantId: string, outcome: string }) => organizationsService.blockTenant(data.tenantId, data.outcome),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'tenants'] });
      }
      toast.success("Tenant blocked successfully");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to block tenant");
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
          <DialogTitle>Block Tenant</DialogTitle>
          <DialogDescription>
            You are about to block the tenant <strong>{tenant?.tenant_admin_full_name || tenant?.id}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-slate-600">
            Blocking this tenant will strictly prevent them from interacting with the platform. You must provide a reason for this governance action.
          </p>
          <div className="space-y-2">
            <Label htmlFor="block-reason">Reason for blocking <span className="text-red-500">*</span></Label>
            <Input 
              id="block-reason"
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
          }} disabled={blockMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              if (tenant && governanceReason.trim()) {
                blockMutation.mutate({ tenantId: tenant.id, outcome: governanceReason.trim() });
              }
            }}
            disabled={blockMutation.isPending || !governanceReason.trim()}
          >
            {blockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Block Tenant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

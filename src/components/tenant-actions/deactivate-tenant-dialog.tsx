import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface DeactivateTenantDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
  orgId?: string;
}

export function DeactivateTenantDialog({ tenant, onClose, onSuccess, orgId }: DeactivateTenantDialogProps) {
  const queryClient = useQueryClient();

  const deactivateMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.deactivateTenant(tenantId),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'tenants'] });
      }
      toast.success("Tenant deactivated successfully");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to deactivate tenant");
    }
  });

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate Tenant</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate the tenant <strong>{tenant?.tenant_admin_full_name || tenant?.id}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-600">
            Deactivating this tenant will immediately revoke its access. The tenant will remain in the system but will no longer be active.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deactivateMutation.isPending}>
            Cancel
          </Button>
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            onClick={() => {
              if (tenant) {
                deactivateMutation.mutate(tenant.id);
              }
            }}
            disabled={deactivateMutation.isPending}
          >
            {deactivateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

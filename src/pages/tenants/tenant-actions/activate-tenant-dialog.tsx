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

interface ActivateTenantDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
  orgId?: string;
}

export function ActivateTenantDialog({ tenant, onClose, onSuccess, orgId }: ActivateTenantDialogProps) {
  const queryClient = useQueryClient();

  const activateMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.activateTenant(tenantId),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'tenants'] });
      }
      toast.success("Tenant activated successfully");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to activate tenant");
    }
  });

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate Tenant</DialogTitle>
          <DialogDescription>
            Are you sure you want to activate the tenant <strong>{tenant?.tenant_admin_full_name || tenant?.id}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-600">
            Activating this tenant will restore their access to the system immediately.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={activateMutation.isPending}>
            Cancel
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            onClick={() => {
              if (tenant) {
                activateMutation.mutate(tenant.id);
              }
            }}
            disabled={activateMutation.isPending}
          >
            {activateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

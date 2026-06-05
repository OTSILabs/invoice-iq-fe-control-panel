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

interface ExpireTenantDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
  orgId?: string;
}

export function ExpireTenantDialog({ tenant, onClose, onSuccess, orgId }: ExpireTenantDialogProps) {
  const queryClient = useQueryClient();

  const expireMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.expireTenant(tenantId),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'tenants'] });
      }
      toast.success("Tenant expired successfully");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to expire tenant");
    }
  });

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Expire Tenant</DialogTitle>
          <DialogDescription>
            Are you sure you want to expire the tenant <strong>{tenant?.tenant_admin_full_name || tenant?.id}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-600">
            Expiring this tenant will immediately mark their plan or subscription as expired, terminating their active usage rights.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={expireMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            onClick={() => {
              if (tenant) {
                expireMutation.mutate(tenant.id);
              }
            }}
            disabled={expireMutation.isPending}
          >
            {expireMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Expire Tenant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

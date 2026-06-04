import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

interface DeleteTenantDialogProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
  orgId?: string;
}

export function DeleteTenantDialog({ tenant, onClose, onSuccess, orgId }: DeleteTenantDialogProps) {
  const queryClient = useQueryClient();
  const [isDeactivateChecked, setIsDeactivateChecked] = useState(false);

  useEffect(() => {
    if (tenant) {
      setIsDeactivateChecked(false);
    }
  }, [tenant]);

  const deactivateMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.deactivateTenant(tenantId),
    onSuccess: () => {
      // Don't invalidate here, wait for delete
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to deactivate tenant before deletion");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (tenantId: string) => organizationsService.deleteTenant(tenantId),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'tenants'] });
      }
      toast.success("Tenant deleted successfully");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete tenant");
    }
  });

  const handleDeleteConfirm = async () => {
    if (!tenant) return;
    
    const isCurrentlyDeactivated = String(tenant.access_status || "").toLowerCase() === 'deactivated';
    
    if (!isCurrentlyDeactivated) {
      if (!isDeactivateChecked) {
        toast.error("You must check the deactivation confirmation box before deleting.");
        return;
      }
      try {
        await deactivateMutation.mutateAsync(tenant.id);
      } catch (error) {
        return; // Deactivation failed, stop deletion process
      }
    }
    
    deleteMutation.mutate(tenant.id);
  };

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setIsDeactivateChecked(false);
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Tenant</DialogTitle>
          <DialogDescription>
            You are about to delete the tenant <strong>{tenant?.tenant_admin_full_name || tenant?.id}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {tenant && String(tenant.access_status || "").toLowerCase() !== 'deactivated' ? (
            <>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 text-sm mb-4">
                This tenant is currently active. You must deactivate the account before it can be deleted.
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="deactivate-confirm" 
                  checked={isDeactivateChecked} 
                  onCheckedChange={(checked) => setIsDeactivateChecked(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="deactivate-confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I understand and confirm deactivation
                  </Label>
                  <p className="text-xs text-slate-500">
                    By checking this, the tenant will be deactivated and then permanently deleted.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600">This action cannot be undone. This will permanently delete the tenant and remove their data from our servers.</p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onClose();
            setIsDeactivateChecked(false);
          }} disabled={deleteMutation.isPending || deactivateMutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteConfirm}
            disabled={
              deleteMutation.isPending || 
              deactivateMutation.isPending || 
              (!!tenant && String(tenant.access_status || "").toLowerCase() !== 'deactivated' && !isDeactivateChecked)
            }
          >
            {(deleteMutation.isPending || deactivateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tenant && String(tenant.access_status || "").toLowerCase() !== 'deactivated' ? "Deactivate & Delete" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

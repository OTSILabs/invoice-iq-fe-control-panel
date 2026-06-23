import {useState} from "react";
import {Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {organizationsService} from "@/api/services/organizations.service";
import {toast} from "sonner";
import type {TenantActionDialogProps, TenantActionType} from "@/types";





export function TenantActionDialog({ action, onClose, orgId, onSuccess }: TenantActionDialogProps) {
  const queryClient = useQueryClient()
  const [outcome, setOutcome] = useState("")

  const tenant = action?.tenant
  const type = action?.type

  const mutation = useMutation({
    mutationFn: async (tenantId: string) => {
      if (!type) return
      switch (type) {
        case "activate":
          return organizationsService.activateTenant(tenantId)
        case "deactivate":
          return organizationsService.deactivateTenant(tenantId)
        case "block":
          return organizationsService.blockTenant(tenantId, outcome)
        case "unblock":
          return organizationsService.unblockTenant(tenantId, outcome)
        case "expire":
          return organizationsService.expireTenant(tenantId)
        case "delete":
          return organizationsService.deleteTenant(tenantId)
      }
    },
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ["organizations", orgId, "tenants"] })
      }
      const labels: Record<TenantActionType, string> = {
        activate: "activated",
        deactivate: "deactivated",
        block: "blocked",
        unblock: "unblocked",
        expire: "expired",
        delete: "deleted"
      }
      toast.success(`Tenant ${labels[type!]} successfully`)
      setOutcome("")
      onSuccess?.()
      onClose()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || `Failed to ${type} tenant`)
    }
  })

  if (!action || !tenant || !type) return null

  const isBlockOrUnblock = type === "block" || type === "unblock"

  const config = {
    activate: { 
      title: "Activate Tenant", 
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm cursor-pointer", 
      text: "Activating this tenant will restore their access to the system immediately.", 
      actionLabel: "Activate" 
    },
    deactivate: { 
      title: "Deactivate Tenant", 
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-sm cursor-pointer", 
      text: "Deactivating this tenant will temporarily suspend their access to the system.", 
      actionLabel: "Deactivate" 
    },
    block: { 
      title: "Block Tenant", 
      btnClass: "bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm cursor-pointer", 
      text: "Blocking this tenant will suspend all their services immediately.", 
      actionLabel: "Block" 
    },
    unblock: { 
      title: "Unblock Tenant", 
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm cursor-pointer", 
      text: "Unblocking this tenant will restore their access.", 
      actionLabel: "Unblock" 
    },
    expire: { 
      title: "Expire Tenant", 
      btnClass: "bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm cursor-pointer", 
      text: "Expiring this tenant will mark their subscription as expired.", 
      actionLabel: "Expire" 
    },
    delete: { 
      title: "Delete Tenant", 
      btnClass: "bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm cursor-pointer", 
      text: "Deleting this tenant is permanent and cannot be undone. All database and user records will be deleted.", 
      actionLabel: "Delete" 
    }
  }[type]

  return (
    <Dialog open={!!action} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            Are you sure you want to {type} the tenant <strong>{tenant.tenant_admin_full_name || tenant.id}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <p className="text-xs text-muted-foreground">{config.text}</p>
          {isBlockOrUnblock && (
            <div className="space-y-1.5">
              <Label htmlFor="outcome" className="text-xs font-semibold">Reason / Outcome</Label>
              <Input
                id="outcome"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder={`Provide a reason to ${type}...`}
                className="h-9"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending} className="cursor-pointer">
            Cancel
          </Button>
          <Button 
            className={config.btnClass}
            size="sm"
            onClick={() => mutation.mutate(tenant.id)}
            disabled={mutation.isPending || (isBlockOrUnblock && !outcome.trim())}
          >
            {mutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {config.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

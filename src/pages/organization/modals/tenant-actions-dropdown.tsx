import {useNavigate} from "react-router-dom";
import {Eye, Ban, CheckCircle2, Lock, Unlock, Clock, Trash2, MoreVertical} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {TenantActionsDropdownProps} from "@/types";



export function TenantActionsDropdown({ tenant, orgId, setTenantAction }: TenantActionsDropdownProps) {
  const navigate = useNavigate()
  const s = String(tenant.access_status || "").toLowerCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-45">
        <DropdownMenuItem 
          onClick={() => {
            const isFromTenantsTab = window.location.pathname.startsWith("/tenants")
            navigate(isFromTenantsTab ? `/tenants/${tenant.id}` : `/organizations/${orgId}/tenants/${tenant.id}`)
          }}
        >
          <Eye className="mr-2 h-4 w-4 text-primary" /> <span>View Details</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTenantAction({ type: s !== 'deactivated' ? "deactivate" : "activate", tenant })} 
          className={s !== 'deactivated' ? "text-amber-600 focus:text-amber-600 focus:bg-amber-50" : "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"}
        >
          {s !== 'deactivated' ? <><Ban className="mr-2 h-4 w-4" /> Deactivate</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Activate</>}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTenantAction({ type: s !== 'blocked' ? "block" : "unblock", tenant })} 
          className={s !== 'blocked' ? "text-red-600 focus:text-red-600 focus:bg-red-50" : "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"}
        >
          {s !== 'blocked' ? <><Lock className="mr-2 h-4 w-4" /> Block</> : <><Unlock className="mr-2 h-4 w-4" /> Unblock</>}
        </DropdownMenuItem>
        
        {s !== 'expired' && (
          <DropdownMenuItem 
            onClick={() => setTenantAction({ type: "expire", tenant })} 
            className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
          >
            <Clock className="mr-2 h-4 w-4" /> Expire
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => setTenantAction({ type: "delete", tenant })} 
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

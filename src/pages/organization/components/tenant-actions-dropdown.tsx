import { useNavigate } from "react-router-dom"
import { Ban, CheckCircle2, Clock, Eye, Lock, MoreVertical, Trash2, Unlock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TenantActionsDropdownProps } from "@/types"

export function TenantActionsDropdown({ tenant, orgId, setTenantAction }: TenantActionsDropdownProps) {
  const navigate = useNavigate()
  const status = String(tenant.access_status || "").toLowerCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0 hover:bg-muted">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-45">
        <DropdownMenuItem
          onClick={() => {
            const isFromTenantsTab = window.location.pathname.startsWith("/tenants")
            navigate(isFromTenantsTab ? `/tenants/${tenant.id}` : `/organizations/${orgId}/tenants/${tenant.id}`)
          }}
        >
          <Eye className="mr-2 size-4 text-primary" />
          <span>View Details</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTenantAction({ type: status !== "deactivated" ? "deactivate" : "activate", tenant })}
          className={status !== "deactivated" ? "text-amber-600 focus:bg-amber-50 focus:text-amber-600" : "text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600"}
        >
          {status !== "deactivated" ? <><Ban className="mr-2 size-4" /> Deactivate</> : <><CheckCircle2 className="mr-2 size-4" /> Activate</>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTenantAction({ type: status !== "blocked" ? "block" : "unblock", tenant })}
          className={status !== "blocked" ? "text-red-600 focus:bg-red-50 focus:text-red-600" : "text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600"}
        >
          {status !== "blocked" ? <><Lock className="mr-2 size-4" /> Block</> : <><Unlock className="mr-2 size-4" /> Unblock</>}
        </DropdownMenuItem>

        {status !== "expired" && (
          <DropdownMenuItem
            onClick={() => setTenantAction({ type: "expire", tenant })}
            className="text-orange-600 focus:bg-orange-50 focus:text-orange-600"
          >
            <Clock className="mr-2 size-4" /> Expire
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setTenantAction({ type: "delete", tenant })}
          className="text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <Trash2 className="mr-2 size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

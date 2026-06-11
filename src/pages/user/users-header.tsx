import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsersHeaderProps {
  onAddClick: () => void
}

export function UsersHeader({ onAddClick }: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Users</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage system access accounts and user permissions.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          size="sm"
          onClick={onAddClick}
          className="w-full sm:w-auto font-medium px-3 shadow-none gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-px cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>
    </div>
  )
}

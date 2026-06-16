import { Info, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileTableHeaderProps {
  entityType: 'organization' | 'tenant'
  isAdding: boolean
  isSaving: boolean
  onAdd: () => void
  onSave: () => void
  onCancel: () => void
}

export function ProfileTableHeader({
  entityType,
  isAdding,
  isSaving,
  onAdd,
  onSave,
  onCancel
}: ProfileTableHeaderProps) {
  return (
    <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Info className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Profile Settings</h3>
          <p className="text-[12px] text-muted-foreground">Manage profile information and keys for this {entityType}.</p>
        </div>
      </div>
      {!isAdding ? (
        <Button variant="outline" size="sm" className="text-xs shadow-none cursor-pointer" onClick={onAdd}>
          <Plus className="size-3.5 mr-1.5" /> Add Profile
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 text-xs shadow-none cursor-pointer" onClick={onSave} disabled={isSaving}>
            <Save className="size-3.5 mr-1.5" /> {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs cursor-pointer border border-border" onClick={onCancel}>
            <X className="size-3.5 mr-1" /> Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

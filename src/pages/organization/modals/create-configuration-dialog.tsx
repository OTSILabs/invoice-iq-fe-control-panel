import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { organizationsService } from "@/api/services/organizations.service"

interface CreateConfigurationDialogProps {
  entityId: string;
  entityType: 'organization' | 'tenant';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateConfigurationDialog({ entityId, entityType, open, onOpenChange }: CreateConfigurationDialogProps) {
  const queryClient = useQueryClient()
  const [newConfigs, setNewConfigs] = useState(() => [{ id: Math.random().toString(), key: "", value: "" }])
  const queryKeyType = entityType === 'organization' ? 'organizations' : 'tenants'

  const createMutation = useMutation({
    mutationFn: (payload: { values: Record<string, string> }) => 
      entityType === 'organization'
        ? organizationsService.updateConfigurations(entityId, payload)
        : organizationsService.updateTenantConfigurations(entityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeyType, entityId, 'configurations'] })
      toast.success("Configurations created successfully")
      onOpenChange(false)
      setNewConfigs([{ id: Math.random().toString(), key: "", value: "" }])
    },
    onError: (error) => {
      toast.error("Failed to create configuration")
      console.error(error)
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validConfigs = newConfigs.filter(c => c.key.trim() && c.value.trim())
    if (validConfigs.length === 0) return
    
    const values = validConfigs.reduce((acc, curr) => {
      acc[curr.key.trim()] = curr.value.trim()
      return acc
    }, {} as Record<string, string>)
    
    createMutation.mutate({ values })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 rounded-xl font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /> Add Configuration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] sm:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Configuration</DialogTitle>
          <DialogDescription>
            Create new configuration key-value pairs for this {entityType}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 pt-4">
          <div className="space-y-4 max-h-[300px] overflow-y-auto p-1">
            {newConfigs.map((config, index) => (
              <div key={config.id} className="flex items-end gap-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor={`key-${config.id}`}>Key</Label>
                  <Input id={`key-${config.id}`} value={config.key} required placeholder="e.g. max_users" className="font-mono text-sm"
                    onChange={e => setNewConfigs(newConfigs.map((c, i) => i === index ? { ...c, key: e.target.value } : c))} />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor={`value-${config.id}`}>Value</Label>
                  <Input id={`value-${config.id}`} value={config.value} required placeholder="e.g. 100"
                    onChange={e => setNewConfigs(newConfigs.map((c, i) => i === index ? { ...c, value: e.target.value } : c))} />
                </div>
                {newConfigs.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 shrink-0"
                    onClick={() => setNewConfigs(newConfigs.filter((_, i) => i !== index))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => setNewConfigs([...newConfigs, { id: Math.random().toString(), key: "", value: "" }])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Row
          </Button>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || newConfigs.some(c => !c.key.trim() || !c.value.trim())} className="bg-blue-600 hover:bg-blue-700 text-white">
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configurations
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

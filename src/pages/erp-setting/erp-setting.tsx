import { useState, useMemo } from "react"
import { AlertCircle, RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useErpSettings } from "@/api/hooks/useErp"
import { ErpSettingFormDialog } from "./erp-setting-form-create"
import { PageHeader } from "@/components/layout/PageHeader"
import { ErpSettingsCards } from "./erp-settings-cards"
import type { ErpSetting } from "@/types"

export function ErpSettings() {
  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useErpSettings()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ErpSetting | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<ErpSetting | null>(null)

  const settings = useMemo(() => data || [], [data])

  const handleRefetch = async () => {
    await refetch()
    toast.success("ERP Settings refreshed")
  }

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      <PageHeader
        title="ERP Settings"
        description="Configure and maintain enterprise ERP integrations."
      >
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefetch}
          className="h-9 w-9 shrink-0 cursor-pointer"
          disabled={isFetching}
        >
          <RefreshCw
            className={isFetching ? "size-4 animate-spin" : "size-4"}
          />
        </Button>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto font-medium px-3 shadow-none shrink-0 gap-1.5 animate-in"
          disabled={isFetching}
        >
          <Plus className="h-4 w-4" /> Add ERP Setting
        </Button>
      </PageHeader>

      {isLoading || isFetching ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Failed to load ERP settings</h2>
            <p className="mt-1 text-muted-foreground">
              There was a connection issue. Please check your network and API
              config.
            </p>
          </div>
          <Button onClick={handleRefetch} variant="outline" className="gap-2" disabled={isFetching}>
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : (
        <ErpSettingsCards
          records={settings}
          onEdit={setEditingRecord}
          onDelete={setDeletingRecord}
        />
      )}

      {(isCreateOpen || !!editingRecord) && (
        <ErpSettingFormDialog
          open={isCreateOpen || !!editingRecord}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false)
              setEditingRecord(null)
            }
          }}
          record={editingRecord}
        />
      )}

      {deletingRecord && (
        <Dialog open={!!deletingRecord} onOpenChange={(open) => !open && setDeletingRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete ERP Setting</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the ERP setting for <strong>{deletingRecord?.display_name || deletingRecord?.erp_type.toUpperCase()}</strong>?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <p className="text-xs text-muted-foreground">
                Deleting this ERP setting is permanent and cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setDeletingRecord(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm cursor-pointer"
                size="sm"
                onClick={() => {
                  toast.success("ERP setting deleted successfully!")
                  setDeletingRecord(null)
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

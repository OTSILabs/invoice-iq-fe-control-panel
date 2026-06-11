import { useState, useMemo } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

import { useErpSettings } from "@/api/hooks/useErp"
import { ErpSettingFormDialog } from "./erp-setting-form-create"
import { ErpSettingsHeader } from "./erp-settings-header"
import { ErpSettingsCards } from "./erp-settings-cards"

export function ErpSettings() {
  const {
    data = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useErpSettings()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const settings = useMemo(() => data || [], [data])
  const usedErpTypes = useMemo(
    () => settings.map((s) => s.erp_type.toLowerCase()),
    [settings]
  )

  const handleRefetch = async () => {
    await refetch()
    toast.success("ERP Settings refreshed")
  }

  return (
    <div className="flex w-full animate-in flex-col gap-6 pb-12 duration-300 fade-in">
      <ErpSettingsHeader
        isFetching={isFetching}
        onRefetch={handleRefetch}
        onAddClick={() => setIsCreateOpen(true)}
      />

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
          <Button onClick={handleRefetch} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : (
        <ErpSettingsCards records={settings} />
      )}

      <ErpSettingFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        usedErpTypes={usedErpTypes}
      />
    </div>
  )
}

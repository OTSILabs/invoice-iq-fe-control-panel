import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ConfigurationsTable } from "@/pages/organization/components/configurations-table"
import { TenantEventsTable } from "@/pages/tenants/tenant-events-table"
import { TenantProfileTab } from "./tenant-profile-tab"
import { TenantDatabaseTab } from "./tenant-database-tab"
import type { Tenant } from "@/types"

interface TenantTabsProps {
  tenant: Tenant
  onAction: (action: {
    type: "activate" | "deactivate" | "block" | "unblock" | "expire" | "delete" | "assignPlan"
    tenant: Tenant
  }) => void
  onRetry: () => void
  isPendingRetry: boolean
  onMigrate: () => void
  isPendingMigrate: boolean
}

export function TenantTabs({
  tenant,
  onAction,
  onRetry,
  isPendingRetry,
  onMigrate,
  isPendingMigrate,
}: TenantTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList variant="line" className="mb-6 justify-start gap-6 [&>button]:flex-none border-b border-border w-full">
        <TabsTrigger value="profile" className="cursor-pointer">
          Profile
        </TabsTrigger>
        <TabsTrigger value="configuration" className="cursor-pointer">
          Configurations
        </TabsTrigger>
        <TabsTrigger value="database" className="cursor-pointer">
          Database
        </TabsTrigger>
        <TabsTrigger value="events" className="cursor-pointer">
          Events
        </TabsTrigger>
      </TabsList>

      {/* PROFILE TAB */}
      <TabsContent value="profile" className="m-0 animate-in fade-in duration-300 space-y-6">
        <TenantProfileTab tenant={tenant} onAction={onAction} />
      </TabsContent>

      {/* CONFIGURATIONS TAB */}
      <TabsContent value="configuration" className="m-0 animate-in fade-in duration-300">
        <ConfigurationsTable entityId={tenant.id} entityType="tenant" />
      </TabsContent>

      {/* DATABASE TAB */}
      <TabsContent value="database" className="m-0 animate-in fade-in duration-300">
        <TenantDatabaseTab
          tenant={tenant}
          onRetry={onRetry}
          isPendingRetry={isPendingRetry}
          onMigrate={onMigrate}
          isPendingMigrate={isPendingMigrate}
        />
      </TabsContent>

      {/* EVENTS TAB */}
      <TabsContent value="events" className="m-0 animate-in fade-in duration-300">
        <TenantEventsTable tenantId={tenant.id} />
      </TabsContent>
    </Tabs>
  )
}

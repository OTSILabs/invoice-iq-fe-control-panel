import { useSearchParams } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ConfigurationsTable } from "@/pages/organization/components/configurations-table"
import { TenantEventsTable } from "@/pages/tenants/tenant-events-table"
import { TenantOverviewTab } from "./tenant-overview-tab"
import { TenantDatabaseTab } from "./tenant-database-tab"
import { ProfileTable } from "@/pages/organization/components/profile-table"
import type { TenantTabsProps } from "@/types"



export function TenantTabs({
  tenant,
  onAction,
  onRetry,
  isPendingRetry,
  onMigrate,
  isPendingMigrate,
}: TenantTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
             <TabsList variant="line" className="border-b border-border w-full justify-start  [&>button]:flex-none">
        <TabsTrigger value="overview" >
          Overview
        </TabsTrigger>
        <TabsTrigger value="configuration" >
          Configurations
        </TabsTrigger>
        <TabsTrigger value="profile" >
          Profile
        </TabsTrigger>
        <TabsTrigger value="database" >
          Database
        </TabsTrigger>
        <TabsTrigger value="events" >
          Events
        </TabsTrigger>
      </TabsList>

      {/* OVERVIEW TAB */}
      <TabsContent
        value="overview"
        className="m-0 animate-in space-y-6 transition-opacity duration-300 fade-in"
      >
        <TenantOverviewTab tenant={tenant} onAction={onAction} />
      </TabsContent>

      {/* CONFIGURATIONS TAB */}
      <TabsContent
        value="configuration"
        className="m-0 animate-in transition-opacity duration-300 fade-in"
      >
        <ConfigurationsTable entityId={tenant.id} entityType="tenant" />
      </TabsContent>

      {/* PROFILE TAB */}
      <TabsContent
        value="profile"
        className="m-0 animate-in transition-opacity duration-300 fade-in"
      >
        <ProfileTable entityId={tenant.id} entityType="tenant" />
      </TabsContent>

      {/* DATABASE TAB */}
      <TabsContent
        value="database"
        className="m-0 animate-in transition-opacity duration-300 fade-in"
      >
        <TenantDatabaseTab
          tenant={tenant}
          onRetry={onRetry}
          isPendingRetry={isPendingRetry}
          onMigrate={onMigrate}
          isPendingMigrate={isPendingMigrate}
        />
      </TabsContent>

      {/* EVENTS TAB */}
      <TabsContent
        value="events"
        className="m-0 animate-in transition-opacity duration-300 fade-in"
      >
        <TenantEventsTable tenantId={tenant.id} />
      </TabsContent>
    </Tabs>
  )
}

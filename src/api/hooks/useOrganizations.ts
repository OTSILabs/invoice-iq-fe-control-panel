import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { organizationsService } from "../services/organizations.service"

export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationsService.getAll(),
  })
}



// Coordinated onboarding mutation hook
export const useOnboardOrganizationAndTenant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orgName,
      slug,
      tenant_role,
      admin_full_name,
      admin_email,
      admin_password,
      plan_id,
      existingOrgId,
    }: {
      orgName: string
      slug: string
      tenant_role: string
      admin_full_name: string
      admin_email: string
      admin_password: string
      plan_id: string
      existingOrgId?: string
    }) => {
      let orgId = existingOrgId

      // 1. Create Organization if it does not exist
      if (!orgId) {
        const createdOrg = await organizationsService.create({ name: orgName })
        orgId = createdOrg.id
      }

      // 2. Build tenant payload details
      const tenantPayloadData = {
        organization_id: orgId,
        slug: slug.replace(/-/g, ""),
        tenant_role,
        configurations: {
          display_name: slug.replace(/-/g, " "),
          max_number_of_invoices: "96000",
          reporting_currency: "INR",
          timezone: "IST",
        },
        profile: {
          display_name: admin_full_name,
          domain_name: slug.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
          reporting_currency: "INR",
          timezone: "IST",
        },
        plan_id,
        plan_valid_from: new Date().toISOString(),
        admin_user: {
          email: admin_email,
          password: admin_password,
          full_name: admin_full_name,
        },
        requested_by: admin_email || "system",
      }

      // 3. Create the tenant under the organization
      const tenant = await organizationsService.createTenant(orgId, tenantPayloadData)

      // 4. Extract tenant ID from response
      const isRecord = (value: unknown): value is Record<string, unknown> => {
        return typeof value === "object" && value !== null
      }
      const getString = (value: unknown): string | undefined => {
        return typeof value === "string" ? value : undefined
      }
      const getTenantIdFromResponse = (response: unknown): string | undefined => {
        if (!isRecord(response)) return undefined
        const tenantData = response.tenant
        const data = response.data
        return (
          getString(response.id) ||
          getString(response.tenant_id) ||
          (isRecord(tenantData) ? getString(tenantData.id) : undefined) ||
          (isRecord(data) ? getString(data.id) || getString(data.tenant_id) : undefined)
        )
      }

      const tenantId = getTenantIdFromResponse(tenant)
      if (!tenantId) {
        throw new Error(
          "Tenant was created, but the tenant ID was not returned for replication."
        )
      }

      return {
        id: tenantId,
        orgId,
        slug,
      }
    },
    onSuccess: (data) => {
      // Invalidate both organizations and specific organization's tenants cache
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      queryClient.invalidateQueries({
        queryKey: ["organizations", data.orgId, "tenants"],
      })
    },
  })
}

// Master data replication mutation hook
export const useReplicateMasterData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tenantId,
      settings,
    }: {
      tenantId: string
      settings: Record<string, boolean>
    }) => organizationsService.replicateMasterData(tenantId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
    },
  })
}

export const useOrganizationDetail = (id?: string) => {
  return useQuery({
    queryKey: ["organizations", id],
    queryFn: () => organizationsService.getById(id!),
    enabled: !!id && id !== "create",
  })
}

export const useOrganizationTenants = (id?: string) => {
  return useQuery({
    queryKey: ["organizations", id, "tenants"],
    queryFn: () => organizationsService.getTenants(id!),
    enabled: !!id && id !== "create",
  })
}

export const useTenantDetailById = (tenantId?: string) => {
  return useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => organizationsService.getTenantById(tenantId!),
    enabled: !!tenantId,
  })
}

export const useEntityConfigurations = (entityId: string, entityType: 'organization' | 'tenant') => {
  return useQuery({
    queryKey: [entityType === 'organization' ? 'organizations' : 'tenants', entityId, 'configurations'],
    queryFn: () => entityType === 'organization'
      ? organizationsService.getConfigurations(entityId)
      : organizationsService.getTenantConfigurations(entityId),
    enabled: !!entityId && (entityType !== 'organization' || entityId !== "create")
  })
}

export const useConfigurationKeys = () => {
  return useQuery({
    queryKey: ["configuration-keys"],
    queryFn: () => organizationsService.getConfigurationKeys(),
  })
}

export const useUpdateEntityConfigurations = (entityId: string, entityType: 'organization' | 'tenant') => {
  const queryClient = useQueryClient()
  const queryKeyType = entityType === 'organization' ? 'organizations' : 'tenants'

  return useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const trimmedValues: Record<string, string> = {}
      for (const [k, v] of Object.entries(values)) {
        if (k.trim()) {
          trimmedValues[k.trim()] = v.trim()
        }
      }
      const payload = { values: trimmedValues }
      return entityType === 'organization'
        ? organizationsService.updateConfigurations(entityId, payload)
        : organizationsService.updateTenantConfigurations(entityId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeyType, entityId, 'configurations'] })
    }
  })
}

export const useEntityProfile = (entityId: string, entityType: 'organization' | 'tenant') => {
  return useQuery({
    queryKey: [entityType === 'organization' ? 'organizations' : 'tenants', entityId, 'profile'],
    queryFn: () => entityType === 'organization'
      ? organizationsService.getProfile(entityId)
      : organizationsService.getTenantProfile(entityId),
    enabled: !!entityId && (entityType !== 'organization' || entityId !== "create")
  })
}

export const useProfileKeys = () => {
  return useQuery({
    queryKey: ["profile-keys"],
    queryFn: () => organizationsService.getProfileKeys(),
  })
}

export const useUpdateEntityProfile = (entityId: string, entityType: 'organization' | 'tenant') => {
  const queryClient = useQueryClient()
  const queryKeyType = entityType === 'organization' ? 'organizations' : 'tenants'

  return useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const trimmedValues: Record<string, string> = {}
      for (const [k, v] of Object.entries(values)) {
        if (k.trim()) {
          trimmedValues[k.trim()] = v.trim()
        }
      }
      const payload = { values: trimmedValues }
      return entityType === 'organization'
        ? organizationsService.updateProfile(entityId, payload)
        : organizationsService.updateTenantProfile(entityId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeyType, entityId, 'profile'] })
    }
  })
}


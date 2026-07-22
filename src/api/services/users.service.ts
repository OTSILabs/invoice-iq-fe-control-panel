import api from "../../lib/axios";
import type {
  PlatformUser,
  PlatformRole,
  CreatePlatformUserPayload,
} from "../../types";

export const usersService = {
  getPlatformUsers: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<PlatformUser[] & { total?: number }> => {
    const response = await api.get<{
      items: PlatformUser[];
      total: number;
    }>("/platform-users", {
      params,
    });

    const items = response.data.items as PlatformUser[] & {
      total?: number;
    };

    items.total = response.data.total;

    return items;
  },

  getPlatformRoles: async (): Promise<PlatformRole[]> => {
    const response = await api.get<PlatformRole[]>("/platform-roles");
    return response.data;
  },

  getPlatformUser: async (id: string): Promise<PlatformUser> => {
    const response = await api.get<PlatformUser>(`/platform-users/${id}`);
    return response.data;
  },

  createPlatformUser: async (
    payload: CreatePlatformUserPayload
  ): Promise<PlatformUser> => {
    const response = await api.post<PlatformUser>(
      "/platform-users",
      payload
    );
    return response.data;
  },

  updatePlatformUserStatus: async (
    id: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<PlatformUser> => {
    const response = await api.patch<PlatformUser>(
      `/platform-users/${id}`,
      { status }
    );
    return response.data;
  },

  updatePlatformUser: async (
    id: string,
    payload: { role_names: string[] }
  ): Promise<PlatformUser> => {
    const response = await api.patch<PlatformUser>(
      `/platform-users/${id}`,
      payload
    );
    return response.data;
  },
};
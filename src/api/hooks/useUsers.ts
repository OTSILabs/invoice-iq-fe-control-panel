import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import type { CreatePlatformUserPayload } from '../../types';

export const usePlatformUsers = (params?: {
  limit?: number;
  offset?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["platform-users", params],
    queryFn: () => usersService.getPlatformUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

export const usePlatformRoles = () => {
  return useQuery({
    queryKey: ['platform-roles'],
    queryFn: () => usersService.getPlatformRoles(),
  });
};

export const usePlatformUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['platform-user', id],
    queryFn: () => usersService.getPlatformUser(id),
    enabled: !!id && enabled,
  });
};

export const useCreatePlatformUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreatePlatformUserPayload) => usersService.createPlatformUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
    },
  });
};



export const useUpdatePlatformUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role_names }: { id: string; role_names: string[] }) =>
      usersService.updatePlatformUser(id, { role_names }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import type { CreatePlatformUserPayload } from '../../types';

export const usePlatformUsers = () => {
  return useQuery({
    queryKey: ['platform-users'],
    queryFn: () => usersService.getPlatformUsers(),
  });
};

export const usePlatformRoles = () => {
  return useQuery({
    queryKey: ['platform-roles'],
    queryFn: () => usersService.getPlatformRoles(),
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

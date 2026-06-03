import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsService } from '../services/organizations.service';

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsService.getAll(),
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => organizationsService.create(payload),
    onSuccess: () => {
      // Invalidate the cache to trigger a re-fetch of the organizations list
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

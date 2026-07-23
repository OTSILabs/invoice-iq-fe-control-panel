import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansService } from '../services/plans.service';

export const usePlans = (params?: {
  limit?: number
  offset?: number
  search?: string
  status?: string
  plan_type?: string
}) => {
 return useQuery({
  queryKey: ["plans", params],
  queryFn: () => plansService.getAll(params),
  placeholderData: (previousData) => previousData,
})
}

export const usePlan = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: () => plansService.getById(id),
    enabled: !!id && enabled,
  });
};

const useCreatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => plansService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

// Backwards compatibility alias
export const useCreatePlanMutation = useCreatePlan;

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      plansService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan', variables.id] });
    },
  });
};

export const useUpdatePlanMutation = useUpdatePlan;

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => plansService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

export const useDeletePlanMutation = useDeletePlan;

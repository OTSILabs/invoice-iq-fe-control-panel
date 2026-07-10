import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansService } from '../services/plans.service';

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => plansService.getAll(),
  });
};

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

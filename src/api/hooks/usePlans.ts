import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansService } from '../services/plans.service';

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => plansService.getAll(),
  });
};

export const useCreatePlan = () => {
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

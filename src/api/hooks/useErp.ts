import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpService } from '../services/erp.service';
import type { CreateErpSettingPayload } from '../../types';

export const useErpSettings = () => {
  return useQuery({
    queryKey: ['erp-settings'],
    queryFn: () => erpService.getErpSettings(),
  });
};

export const useCreateErpSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateErpSettingPayload) => erpService.createErpSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-settings'] });
    },
  });
};

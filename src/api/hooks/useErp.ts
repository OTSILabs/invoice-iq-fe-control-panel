import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpService } from '../services/erp.service';
import type { CreateErpSettingPayload, ErpSetting } from '../../types';

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

export const useUpdateErpSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ erpId, payload }: { erpId: number | string; payload: Partial<ErpSetting> }) =>
      erpService.updateErpSetting(erpId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-settings'] });
    },
  });
};

export const useDeleteErpSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (erpId: number | string) => erpService.deleteErpSetting(erpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-settings'] });
    },
  });
};

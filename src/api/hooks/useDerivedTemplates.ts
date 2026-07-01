import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { derivedTemplatesService } from '../services/derived-templates.service';
import type { StandardDerivedTemplateCreateRequest, StandardDerivedTemplateUpdateRequest, StandardDerivedTemplateResponse } from '../../types';

export const useDerivedTemplates = (options?: Omit<UseQueryOptions<StandardDerivedTemplateResponse[]>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['derived-templates'],
    queryFn: () => derivedTemplatesService.list(),
    ...options,
  });
};


export const useCreateDerivedTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: StandardDerivedTemplateCreateRequest) => derivedTemplatesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['derived-templates'] });
    },
  });
};

export const useUpdateDerivedTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ derivedTemplateId, payload }: { derivedTemplateId: string; payload: StandardDerivedTemplateUpdateRequest }) =>
      derivedTemplatesService.update(derivedTemplateId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['derived-templates'] });
      queryClient.invalidateQueries({ queryKey: ['derived-templates', data.derived_template_id] });
    },
  });
};

export const useDeleteDerivedTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (derivedTemplateId: string) => derivedTemplatesService.delete(derivedTemplateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['derived-templates'] });
    },
  });
};

export const useDerivedTemplate = (derivedTemplateId: string, options = {}) => {
  return useQuery({
    queryKey: ['derived-templates', derivedTemplateId],
    queryFn: () => derivedTemplatesService.get(derivedTemplateId),
    enabled: !!derivedTemplateId,
    ...options,
  });
};


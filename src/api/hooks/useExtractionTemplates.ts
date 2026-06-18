import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractionTemplatesService } from '../services/extraction-templates.service';
import type { StandardExtractionTemplateCreateRequest, StandardExtractionTemplateUpdateRequest } from '../../types';

export const useExtractionTemplates = () => {
  return useQuery({
    queryKey: ['extraction-templates'],
    queryFn: () => extractionTemplatesService.list(),
  });
};


export const useCreateExtractionTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: StandardExtractionTemplateCreateRequest) => extractionTemplatesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extraction-templates'] });
    },
  });
};

export const useUpdateExtractionTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, payload }: { templateId: string; payload: StandardExtractionTemplateUpdateRequest }) =>
      extractionTemplatesService.update(templateId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['extraction-templates'] });
      queryClient.invalidateQueries({ queryKey: ['extraction-templates', data.template_id] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractionFieldsService } from '../services/extraction-fields.service';
import type { StandardExtractionFieldCreateRequest, StandardExtractionFieldUpdateRequest } from '../../types';

export const useExtractionFields = () => {
  return useQuery({
    queryKey: ['extraction-fields'],
    queryFn: () => extractionFieldsService.list(),
  });
};

export const useExtractionField = (fieldId: string | undefined) => {
  return useQuery({
    queryKey: ['extraction-fields', fieldId],
    queryFn: () => extractionFieldsService.get(fieldId!),
    enabled: !!fieldId,
  });
};


export const useCreateExtractionField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: StandardExtractionFieldCreateRequest) => extractionFieldsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extraction-fields'] });
    },
  });
};

export const useUpdateExtractionField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fieldId, payload }: { fieldId: string; payload: StandardExtractionFieldUpdateRequest }) =>
      extractionFieldsService.update(fieldId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['extraction-fields'] });
      queryClient.invalidateQueries({ queryKey: ['extraction-fields', data.field_id] });
    },
  });
};

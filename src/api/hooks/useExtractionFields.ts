import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractionFieldsService } from '../services/extraction-fields.service';
import type { StandardExtractionFieldCreateRequest, StandardExtractionFieldUpdateRequest, StandardExtractionFieldResponse } from '../../types';

import type { UseQueryOptions } from '@tanstack/react-query';

export const useExtractionFields = (options?: Omit<UseQueryOptions<StandardExtractionFieldResponse[]>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['extraction-fields'],
    queryFn: () => extractionFieldsService.list(),
    ...options,
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

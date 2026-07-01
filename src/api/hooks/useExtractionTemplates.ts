import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { extractionTemplatesService } from '../services/extraction-templates.service';
import type { StandardExtractionTemplateResponse } from '../../types';

export const useExtractionTemplates = (options?: Omit<UseQueryOptions<StandardExtractionTemplateResponse[]>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['extraction-templates'],
    queryFn: () => extractionTemplatesService.list(),
    ...options,
  });
};

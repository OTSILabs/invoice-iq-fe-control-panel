import { useQuery } from '@tanstack/react-query';
import { extractionTemplatesService } from '../services/extraction-templates.service';

export const useExtractionTemplates = () => {
  return useQuery({
    queryKey: ['extraction-templates'],
    queryFn: () => extractionTemplatesService.list(),
  });
};

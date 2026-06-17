import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldCategoriesService } from '../services/field-categories.service';
import type { FieldCategoryCreateRequest, FieldCategoryUpdateRequest } from '../../types';

export const useFieldCategories = () => {
  return useQuery({
    queryKey: ['field-categories'],
    queryFn: () => fieldCategoriesService.getAll(),
  });
};

export const useFieldCategory = (code: string) => {
  return useQuery({
    queryKey: ['field-categories', code],
    queryFn: () => fieldCategoriesService.get(code),
    enabled: !!code,
  });
};

export const useCreateFieldCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: FieldCategoryCreateRequest) => fieldCategoriesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-categories'] });
    },
  });
};

export const useUpdateFieldCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: FieldCategoryUpdateRequest }) =>
      fieldCategoriesService.update(code, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['field-categories'] });
      queryClient.invalidateQueries({ queryKey: ['field-categories', data.field_category_code] });
    },
  });
};

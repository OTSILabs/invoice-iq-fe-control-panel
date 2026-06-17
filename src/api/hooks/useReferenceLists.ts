import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referenceListsService } from '../services/reference-lists.service';
import type {
  ReferenceListRegistryCreateRequest,
  ReferenceListRegistryUpdateRequest,
  ReferenceValueCreateRequest,
  ReferenceValueUpdateRequest
} from '../../types';

export const useReferenceLists = () => {
  return useQuery({
    queryKey: ['reference-lists'],
    queryFn: () => referenceListsService.getAll(),
  });
};

export const useReferenceListDetail = (key: string) => {
  return useQuery({
    queryKey: ['reference-lists', key],
    queryFn: () => referenceListsService.get(key),
    enabled: !!key,
  });
};

export const useReferenceValues = (key: string) => {
  return useQuery({
    queryKey: ['reference-values', key],
    queryFn: () => referenceListsService.getValues(key),
    enabled: !!key,
  });
};

export const useCreateReferenceRegistry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReferenceListRegistryCreateRequest) => referenceListsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reference-lists'] });
    },
  });
};

export const useUpdateReferenceRegistry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: ReferenceListRegistryUpdateRequest }) =>
      referenceListsService.update(key, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reference-lists'] });
      queryClient.invalidateQueries({ queryKey: ['reference-lists', data.registry_key] });
    },
  });
};

export const useCreateReferenceValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: ReferenceValueCreateRequest }) =>
      referenceListsService.createValue(key, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reference-values', variables.key] });
    },
  });
};

export const useUpdateReferenceValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, valueCode, payload }: { key: string; valueCode: string; payload: ReferenceValueUpdateRequest }) =>
      referenceListsService.updateValue(key, valueCode, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reference-values', variables.key] });
    },
  });
};

export const useReferenceValueDetail = (key: string, valueCode: string) => {
  return useQuery({
    queryKey: ['reference-values', key, valueCode],
    queryFn: () => referenceListsService.getValue(key, valueCode),
    enabled: !!key && !!valueCode,
  });
};

export const useReferenceListPublications = (apiKey?: string) => {
  return useQuery({
    queryKey: ['reference-list-publications', apiKey],
    queryFn: () => referenceListsService.listPublications(apiKey),
  });
};

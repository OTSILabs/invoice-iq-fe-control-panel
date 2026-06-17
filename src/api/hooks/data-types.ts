import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { datatypeService } from "../services/data-types.service"
import type { CreateDataTypePayload } from "../services/data-types.service"

export const useDataTypes = () => {
  return useQuery({
    queryKey: ["data-types"],
    queryFn: () => datatypeService.getDataTypes(),
  })
}

export const useCreateDataTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDataTypePayload) =>
      datatypeService.createDataType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-types"] })
    },
  })
}

export const useDataType = (data_type_code: string, enabled = true) => {
  return useQuery({
    queryKey: ["data-type", data_type_code],
    queryFn: () => datatypeService.getDataType(data_type_code),
    enabled: !!data_type_code && enabled,
  })
}

export const useUpdateDataTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      data_type_code,
      payload,
    }: {
      data_type_code: string
      payload: Partial<CreateDataTypePayload>
    }) => datatypeService.updateDataType(data_type_code, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["data-types"] })
      queryClient.invalidateQueries({ queryKey: ["data-type", variables.data_type_code] })
    },
  })
}

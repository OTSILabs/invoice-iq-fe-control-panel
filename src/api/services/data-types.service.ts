import api from "../../lib/axios"
import type { DataType, CreateDataTypePayload } from "../../types"

export const datatypeService = {
  getDataTypes: async (): Promise<DataType[]> => {
    const response = await api.get<DataType[]>("/api/platform-standard-content/data-types")
    return response.data
  },

  createDataType: async (payload: CreateDataTypePayload): Promise<DataType> => {
    const response = await api.post<DataType>(
      "/api/platform-standard-content/data-types",
      payload
    )
    return response.data
  },

  getDataType: async (data_type_code: string): Promise<DataType> => {
    const response = await api.get<DataType>(
      `/api/platform-standard-content/data-types/${data_type_code}`
    )
    return response.data
  },

  updateDataType: async (
    data_type_code: string,
    payload: Partial<CreateDataTypePayload>
  ): Promise<DataType> => {
    const response = await api.patch<DataType>(
      `/api/platform-standard-content/data-types/${data_type_code}`,
      payload
    )
    return response.data
  },
}

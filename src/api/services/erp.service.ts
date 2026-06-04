import api from '../axios';
import type { ErpSetting, CreateErpSettingPayload } from '../../types';

export const erpService = {
  getErpSettings: async (): Promise<ErpSetting[]> => {
    const response = await api.get<ErpSetting[]>('/api/erp-sample-settings');
    return response.data;
  },

  createErpSetting: async (payload: CreateErpSettingPayload): Promise<ErpSetting> => {
    const response = await api.post<ErpSetting>('/api/erp-sample-settings', payload);
    return response.data;
  }
};

import api from '../../lib/axios';

import type { LoginPayload, LoginResponse } from '../../types';

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },
};

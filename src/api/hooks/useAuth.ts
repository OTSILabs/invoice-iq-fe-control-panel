import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { LoginPayload, LoginResponse } from '../../types';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation<any, Error, LoginPayload>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Store the entire auth response as a single JSON string
      sessionStorage.setItem('token', JSON.stringify(data));
      navigate('/dashboard', { replace: true });
    },
  });
};

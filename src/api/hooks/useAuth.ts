import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { AuthAPI } from "../services/auth.service"
import { toast } from "sonner"
import type { LoginPayload, LoginResponse } from "../../types"

export const useAuth = () => {
  const navigate = useNavigate()

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload: LoginPayload) => {
      return AuthAPI.login(payload)
    },
    onSuccess: (data) => {
      // Store the auth response in sessionStorage
      sessionStorage.setItem("token", JSON.stringify(data))
      toast.success("Successfully logged in!")
      navigate("/organizations", { replace: true })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Invalid email or password")
    },
    retry: false,
  })
}

// Keep useLogin as a backwards compatible alias
export const useLogin = useAuth

export const useAuthMe = (options = {}) => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => AuthAPI.me(),
    retry: false,
    ...options,
  })
}

export const useRegister = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: any) => {
      return AuthAPI.register(payload)
    },
    onSuccess: () => {
      toast.success("Registration successful! Please login.")
      navigate("/login")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Registration failed")
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: ({ client_name, email }: { client_name: string; email: string }) => {
      return AuthAPI.forgotPassword(client_name, email)
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "Password reset link sent to your email.")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Unable to send reset link. Please try again."
      )
    },
    retry: false,
  })
}

export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: any) => {
      return AuthAPI.resetPassword(payload)
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "Password reset successful. Please sign in.")
      navigate("/login")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Unable to reset password. Please try again."
      )
    },
    retry: false,
  })
}

export const useChangePassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: any) => {
      return AuthAPI.changePassword(payload)
    },
    onSuccess: (data: any) => {
      toast.success(
        data?.message || "Password changed successfully. Please login again."
      )
      sessionStorage.clear()
      navigate("/login")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || error?.message || "Unable to change password. Please try again."
      )
    },
    retry: false,
  })
}

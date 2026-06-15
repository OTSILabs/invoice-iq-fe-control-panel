import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { AuthAPI } from "../services/auth.service"
import { toast } from "sonner"
import type { LoginPayload, LoginResponse } from "../../types"

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload: LoginPayload) => {
      return AuthAPI.login(payload)
    },
    onSuccess: (data) => {
      // Store the auth response in sessionStorage
      sessionStorage.setItem("token:v1", JSON.stringify(data))
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
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



export const useChangePassword = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: any) => {
      return AuthAPI.changePassword(payload)
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
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

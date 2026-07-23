import api from "../../lib/axios"
import type { LoginPayload, LoginResponse } from "../../types"

export class AuthAPI {
  static async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", payload)
    return response.data
  }

  static async refreshToken(refreshToken: string): Promise<any> {
    const response = await api.post("/auth/refresh", { refresh_token: refreshToken })
    return response.data
  }

  static async me(): Promise<any> {
    const response = await api.get("/auth/me")
    return response.data
  }

  static async invite(email: string, roles: string[]): Promise<any> {
    const response = await api.post("/auth/invite", { email, roles })
    return response.data
  }

  static async resendInvite(email: string): Promise<any> {
    const response = await api.post("/auth/invite/resend", { email })
    return response.data
  }

  static async register(payload: any): Promise<any> {
    const response = await api.post("/auth/register", payload)
    return response.data
  }

  static async forgotPassword(client_name: string, email: string): Promise<any> {
    const response = await api.post("/auth/forgot-password", { client_name, email })
    return response.data
  }

  static async resetPassword(payload: any): Promise<any> {
    const response = await api.post("/auth/reset-password", payload)
    return response.data
  }

  static async changePassword(payload: any): Promise<any> {
    const response = await api.post("/auth/change-password", payload)
    return response.data
  }
}



import { useCallback, useMemo } from "react";
import { useAuthMe } from "@/api/hooks/useAuth";
import { getDecodedToken } from "@/lib/utils";
import { clearSession } from "@/lib/auth-store";

export function useUser() {
  const { data: profile, isLoading, isError, refetch, isRefetching } = useAuthMe();
  const jwt = useMemo(() => getDecodedToken() || {}, []);

  const user = useMemo(() => {
    const name = profile?.full_name || profile?.name || jwt.name || jwt.username || jwt.email?.split("@")[0] || "User";
    const role = profile?.role_name || profile?.role || jwt.roles || jwt.role || jwt.app_metadata?.role || "user";
    
    return {
      name,
      full_name: name,
      username: jwt.username || name,
      email: profile?.email || jwt.email || "",
      role: String(role).toLowerCase(),
      id: profile?.id || jwt.sub || null,
      avatar: profile?.avatar || null,
    };
  }, [profile, jwt]);

  const logout = useCallback(() => {
    clearSession();
    sessionStorage.clear();
    window.location.href = "/login";
  }, []);

  return {
    user,
    isMounted: true,
    isLoggedIn: !!user.name,
    logout,
    userInfo: profile,
    isLoadingUserInfo: isLoading,
    isErrorUserInfo: isError,
    refetchUserInfo: refetch,
    isRefetchingUserInfo: isRefetching,
  };
}

import { Navigate, useLocation } from "react-router-dom";

const isAuthenticated = (): boolean => {
  try {
    const tokenStr = sessionStorage.getItem("token");
    if (!tokenStr) return false;
    const parsed = JSON.parse(tokenStr);
    return !!(parsed.access_token || parsed.token);
  } catch {
    return !!sessionStorage.getItem("token");
  }
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

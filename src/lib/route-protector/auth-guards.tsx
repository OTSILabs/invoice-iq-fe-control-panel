import { Navigate, useLocation } from "react-router-dom";

const isAuthenticated = (): boolean => {
  const tokenStr = sessionStorage.getItem("token:v1");
  if (!tokenStr) return false;
  try {
    const parsed = JSON.parse(tokenStr);
    return !!(parsed.access_token || parsed.token);
  } catch {
    return true;
  }
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <Navigate to="/organizations" replace /> : <>{children}</>;
};

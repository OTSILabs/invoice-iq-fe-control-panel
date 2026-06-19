import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../auth-store";

const isAuthenticated = (): boolean => {
  const session = getSession();
  if (!session || (!session.access_token && !session.token)) return false;
  return true;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <Navigate to="/organizations" replace /> : <>{children}</>;
};

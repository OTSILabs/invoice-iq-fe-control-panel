import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const tokenStr = sessionStorage.getItem('token');
  const location = useLocation();

  let hasToken = false;
  if (tokenStr) {
    try {
      const parsed = JSON.parse(tokenStr);
      hasToken = !!(parsed.access_token || parsed.token);
    } catch (e) {
      hasToken = !!tokenStr;
    }
  }

  if (!hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const tokenStr = sessionStorage.getItem('token');
  
  let hasToken = false;
  if (tokenStr) {
    try {
      const parsed = JSON.parse(tokenStr);
      hasToken = !!(parsed.access_token || parsed.token);
    } catch (e) {
      hasToken = !!tokenStr;
    }
  }

  if (hasToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

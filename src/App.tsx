import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/layout"
import { LoginPage } from "./components/Login/login-page"
import { APP_ROUTES } from "./config/routes"
import { ProtectedRoute, PublicRoute } from "./components/auth-guards"

export function App() {
  useEffect(() => {
    const syncLogout = (e: StorageEvent) => {
      // If the token is removed or the entire localStorage is cleared
      // Note: this mostly works for localStorage across tabs, but keeping it for compatibility
      if ((e.key === 'token' && e.newValue === null) || e.key === null) {
        if (window.location.pathname !== '/login') {
          window.dispatchEvent(new Event('auth:logout'));
        }
      }
    };
    
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          {APP_ROUTES.map((route) => (
            <Route 
              key={route.path} 
              path={route.path.replace(/^\//, '')} // Remove leading slash for nested routes
              element={<route.component />} 
            />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/layout"
import { LoginPage } from "./components/Login/login-page"
import { APP_ROUTES } from "./config/routes"
import { ProtectedRoute, PublicRoute } from "./components/auth-guards"
import { OrganizationDetail } from "./pages/organization/organization-detail"

export function App() {
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
          <Route path="organizations/:id" element={<OrganizationDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

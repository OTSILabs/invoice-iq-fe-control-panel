
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"

import { LoginPage } from "./pages/login/login-page"
import { APP_ROUTES } from "./config/routes"
import { ProtectedRoute, PublicRoute } from "./lib/route-protector/auth-guards"
import { OrganizationDetail } from "./pages/organization/organization-detail"
import { TenantDetail } from "./pages/tenants/tenant-detail"
import { FieldCategoryDetails } from "./pages/platform-standard-content/field-categories/field-category-details"
import { Layout } from "./components/layout/layout"

function OrgRedirect() {
  const { id } = useParams()
  return <Navigate to={`/organizations/${id}`} replace />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="organizations" replace />} />
          {APP_ROUTES.map((route) => {
            if (route.children) {
              return (
                <Route key={route.path} path={route.path.replace(/^\//, '')}>
                  <Route index element={<Navigate to={route.children[0].path} replace />} />
                  {route.children.map((child) => (
                    <Route 
                      key={child.path} 
                      path={child.path.replace(route.path, '').replace(/^\//, '')} 
                      element={<child.component />} 
                    />
                  ))}
                </Route>
              )
            }
            if (route.component) {
              return (
                <Route 
                  key={route.path} 
                  path={route.path.replace(/^\//, '')} // Remove leading slash for nested routes
                  element={<route.component />} 
                />
              )
            }
            return null
          })}
          <Route path="organizations/:id" element={<OrganizationDetail />} />
          <Route path="organizations/:id/tenants" element={<OrgRedirect />} />
          <Route path="organizations/:orgId/tenants/:tenantId" element={<TenantDetail />} />
          <Route path="platform-standard-content/field-categories/:code" element={<FieldCategoryDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/organizations" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


import * as React from "react"
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"

import { LoginPage } from "./pages/login/login-page"
import { APP_ROUTES } from "./config/routes"
import { ProtectedRoute, PublicRoute } from "./lib/route-protector/auth-guards"
import { OrganizationDetail } from "./pages/organization/organization-detail"
import { TenantDetail } from "./pages/tenants/tenant-detail"
import { DataTypeDetail } from "./pages/platform-standard-content/data-type/data-type-detail"
import { FieldCategoryDetails } from "./pages/platform-standard-content/field-categories/field-category-details"
import { ReferenceListDetails } from "./pages/platform-standard-content/reference-lists/reference-list-details"
import { ReferenceValueDetails } from "./pages/platform-standard-content/reference-lists/reference-value-details"
import { ValidationRuleDetail } from "./pages/platform-standard-content/validation rule/validation-rule-detail"
import { NormalizationRuleDetail } from "./pages/platform-standard-content/normalization-rule/normalization-rule-detail"
import { UserDetail } from "./pages/user/user-detail"
import { Layout } from "./components/layout/layout"

const TemplateCreatePage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-create.page"))
const TemplateDetailsPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-details.page"))
const TemplateEditPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-edit.page"))

const DerivedTemplateCreatePage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/derived/derived-template-create.page"))
const DerivedTemplateEditPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/derived/derived-template-edit.page"))


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
              const isPlatformContent = route.path === "/platform-standard-content"
              return (
                <Route key={route.path} path={route.path.replace(/^\//, '')}>
                  <Route index element={<Navigate to={route.children[0].path} replace />} />
                  {route.children.map((subRoute) => (
                    <Route 
                      key={subRoute.path} 
                      path={subRoute.path.split('/').pop()} // Use only the last part of path
                      element={<subRoute.component />} 
                    />
                  ))}
                  {isPlatformContent && (
                    <>
                      <Route path="data-types/:code" element={<DataTypeDetail />} />
                      <Route path="field-categories/:code" element={<FieldCategoryDetails />} />
                      <Route path="reference-lists/:key" element={<ReferenceListDetails />} />
                      <Route path="reference-lists/:key/:valueCode" element={<ReferenceValueDetails />} />

                        <Route path="extraction-management/templates/new" element={<React.Suspense fallback={null}><TemplateCreatePage /></React.Suspense>} />
                        <Route path="extraction-management/templates/:templateCode" element={<React.Suspense fallback={null}><TemplateDetailsPage /></React.Suspense>} />
                        <Route path="extraction-management/templates/:templateCode/edit" element={<React.Suspense fallback={null}><TemplateEditPage /></React.Suspense>} />

                      <Route path="extraction-management/derived/new" element={<React.Suspense fallback={null}><DerivedTemplateCreatePage /></React.Suspense>} />
                      <Route path="extraction-management/derived/:derivedTemplateId/edit" element={<React.Suspense fallback={null}><DerivedTemplateEditPage /></React.Suspense>} />

                    </>
                  )}
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
          <Route path="tenants/:tenantId" element={<TenantDetail />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route
            path="platform-standard-content/data-types/:code"
            element={<DataTypeDetail />}
          />
          <Route
            path="platform-standard-content/field-categories/:code"
            element={<FieldCategoryDetails />}
          />
          <Route
            path="platform-standard-content/validation-rules/:code"
            element={<ValidationRuleDetail />}
          />
          <Route
            path="platform-standard-content/normalization-rules/:code"
            element={<NormalizationRuleDetail />}
          />
          <Route
            path="platform-standard-content/reference-lists/:key"
            element={<ReferenceListDetails />}
          />
          <Route
            path="platform-standard-content/reference-lists/:key/:valueCode"
            element={<ReferenceValueDetails />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/organizations" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

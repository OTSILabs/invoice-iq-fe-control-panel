
import * as React from "react"
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"

import { LoginPage } from "./pages/login/login-page"
import { APP_ROUTES } from "./config/routes"
import { ProtectedRoute, PublicRoute } from "./lib/route-protector/auth-guards"
import { OrganizationDetail } from "./pages/organization/organization-detail"
import { OrganizationOnboardingPage } from "./pages/organization/organization-onboarding-page"
import { TenantDetail } from "./pages/tenants/tenant-detail"
import { DataTypeDetail } from "./pages/platform-standard-content/data-type/data-type-detail"
import { DataTypeFormPage } from "./pages/platform-standard-content/data-type/data-type-form-page"
import { FieldCategoryDetails } from "./pages/platform-standard-content/field-categories/field-category-details"
import { FieldCategoryFormPage } from "./pages/platform-standard-content/field-categories/field-category-form-page"
import { ReferenceListDetails } from "./pages/platform-standard-content/reference-lists/reference-list-details"
import { ReferenceListFormPage } from "./pages/platform-standard-content/reference-lists/reference-list-form-page"
import { ReferenceValueDetails } from "./pages/platform-standard-content/reference-lists/reference-value-details"
import { ReferenceValueFormPage } from "./pages/platform-standard-content/reference-lists/reference-value-form-page"
import { ValidationRuleFormPage } from "./pages/platform-standard-content/validation rule/validation-rule-form-page"
import { NormalizationRuleFormPage } from "./pages/platform-standard-content/normalization-rule/normalization-rule-form-page"
import { UserDetail } from "./pages/user/user-detail"
import { UserCreate } from "./pages/user/user-create"
import { UserEdit } from "./pages/user/user-edit"
import { ErpSettingFormPage } from "./pages/erp-setting/erp-setting-form-page"
import { ExtractionFieldFormPage } from "./pages/platform-standard-content/extraction-management/extraction-field-form-page"
import { Layout } from "./components/layout/layout"

const TemplateCreatePage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-create.page"))
const TemplateDetailsPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-details.page"))
const TemplateEditPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-edit.page"))
const TemplateFieldEditPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-field-edit.page"))

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
                      <Route path="data-types/create" element={<DataTypeFormPage mode="create" />} />
                      <Route path="data-types/:code/edit" element={<DataTypeFormPage mode="edit" />} />
                      <Route path="field-categories/:code" element={<FieldCategoryDetails />} />
                      <Route path="field-categories/create" element={<FieldCategoryFormPage mode="create" />} />
                      <Route path="field-categories/:code/edit" element={<FieldCategoryFormPage mode="edit" />} />
                      <Route path="reference-lists/create" element={<ReferenceListFormPage mode="create" />} />
                      <Route path="reference-lists/:key/edit" element={<ReferenceListFormPage mode="edit" />} />
                      <Route path="reference-lists/:key/values/create" element={<ReferenceValueFormPage mode="create" />} />
                      <Route path="reference-lists/:key/:valueCode/edit" element={<ReferenceValueFormPage mode="edit" />} />
                      <Route path="reference-lists/:key" element={<ReferenceListDetails />} />
                      <Route path="reference-lists/:key/:valueCode" element={<ReferenceValueDetails />} />
                      <Route path="validation-rules/create" element={<ValidationRuleFormPage mode="create" />} />
                      <Route path="validation-rules/:code/edit" element={<ValidationRuleFormPage mode="edit" />} />
                      <Route path="normalization-rules/create" element={<NormalizationRuleFormPage mode="create" />} />
                      <Route path="normalization-rules/:code/edit" element={<NormalizationRuleFormPage mode="edit" />} />

                      <Route path="extraction-management/fields/create" element={<ExtractionFieldFormPage mode="create" />} />
                      <Route path="extraction-management/fields/:fieldId/edit" element={<ExtractionFieldFormPage mode="edit" />} />
                        <Route path="extraction-management/templates/new" element={<React.Suspense fallback={null}><TemplateCreatePage /></React.Suspense>} />
                        <Route path="extraction-management/templates/:templateCode" element={<React.Suspense fallback={null}><TemplateDetailsPage /></React.Suspense>} />
                        <Route path="extraction-management/templates/:templateCode/edit" element={<React.Suspense fallback={null}><TemplateEditPage /></React.Suspense>} />
                        <Route path="extraction-management/templates/:templateCode/fields/:fieldId/edit" element={<React.Suspense fallback={null}><TemplateFieldEditPage /></React.Suspense>} />

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
          <Route path="organizations/create" element={<OrganizationOnboardingPage />} />
          <Route path="organizations/:orgId/tenants/create" element={<OrganizationOnboardingPage />} />
          <Route path="organizations/:id" element={<OrganizationDetail />} />
          <Route path="organizations/:id/tenants" element={<OrgRedirect />} />
          <Route path="organizations/:orgId/tenants/:tenantId" element={<TenantDetail />} />
          <Route path="tenants/:tenantId" element={<TenantDetail />} />
          <Route path="users/create" element={<UserCreate />} />
          <Route path="users/:id/edit" element={<UserEdit />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="erp-settings/create" element={<ErpSettingFormPage mode="create" />} />
          <Route path="erp-settings/:id/edit" element={<ErpSettingFormPage mode="edit" />} />
        </Route>

        <Route path="*" element={<Navigate to="/organizations" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

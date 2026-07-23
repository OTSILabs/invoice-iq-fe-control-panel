
import * as React from "react"
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"

import { LoginPage } from "./pages/login/login-page"
import { APP_ROUTES } from "./config/routes"
import { ProtectedRoute, PublicRoute } from "./lib/route-protector/auth-guards"
import { Layout } from "./components/layout/layout"

const OrganizationDetail = React.lazy(() => import("./pages/organization/organization-detail").then(m => ({ default: m.OrganizationDetail })))
const OrganizationOnboardingPage = React.lazy(() => import("./pages/organization/organization-onboarding-page").then(m => ({ default: m.OrganizationOnboardingPage })))
const TenantDetail = React.lazy(() => import("./pages/tenants/tenant-detail").then(m => ({ default: m.TenantDetail })))
const DataTypeDetail = React.lazy(() => import("./pages/platform-standard-content/data-type/data-type-detail").then(m => ({ default: m.DataTypeDetail })))
const DataTypeFormPage = React.lazy(() => import("./pages/platform-standard-content/data-type/data-type-form-page").then(m => ({ default: m.DataTypeFormPage })))
const FieldCategoryDetails = React.lazy(() => import("./pages/platform-standard-content/field-categories/field-category-details").then(m => ({ default: m.FieldCategoryDetails })))
const FieldCategoryFormPage = React.lazy(() => import("./pages/platform-standard-content/field-categories/field-category-form-page").then(m => ({ default: m.FieldCategoryFormPage })))
const ReferenceListDetails = React.lazy(() => import("./pages/platform-standard-content/reference-lists/reference-list-details").then(m => ({ default: m.ReferenceListDetails })))
const ReferenceListFormPage = React.lazy(() => import("./pages/platform-standard-content/reference-lists/reference-list-form-page").then(m => ({ default: m.ReferenceListFormPage })))
const ReferenceValueDetails = React.lazy(() => import("./pages/platform-standard-content/reference-lists/reference-value-details").then(m => ({ default: m.ReferenceValueDetails })))
const ReferenceValueFormPage = React.lazy(() => import("./pages/platform-standard-content/reference-lists/reference-value-form-page").then(m => ({ default: m.ReferenceValueFormPage })))
const ValidationRuleFormPage = React.lazy(() => import("./pages/platform-standard-content/validation rule/validation-rule-form-page").then(m => ({ default: m.ValidationRuleFormPage })))
const ValidationRuleDetail = React.lazy(() => import("./pages/platform-standard-content/validation rule/validation-rule-detail").then(m => ({ default: m.ValidationRuleDetail })))
const NormalizationRuleFormPage = React.lazy(() => import("./pages/platform-standard-content/normalization-rule/normalization-rule-form-page").then(m => ({ default: m.NormalizationRuleFormPage })))
const NormalizationRuleDetail = React.lazy(() => import("./pages/platform-standard-content/normalization-rule/normalization-rule-detail").then(m => ({ default: m.NormalizationRuleDetail })))
const UserDetail = React.lazy(() => import("./pages/user/user-detail").then(m => ({ default: m.UserDetail })))
const UserCreate = React.lazy(() => import("./pages/user/user-create").then(m => ({ default: m.UserCreate })))
const UserEdit = React.lazy(() => import("./pages/user/user-edit").then(m => ({ default: m.UserEdit })))
const PlanDetail = React.lazy(() => import("./pages/plans/plan-detail").then(m => ({ default: m.PlanDetail })))
const EditPlan = React.lazy(() => import("./pages/plans/edit-plan").then(m => ({ default: m.EditPlan })))
const ErpSettingFormPage = React.lazy(() => import("./pages/erp-setting/erp-setting-form-page").then(m => ({ default: m.ErpSettingFormPage })))
const ExtractionFieldFormPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/extraction-field-form-page").then(m => ({ default: m.ExtractionFieldFormPage })))
const ExtractionFieldDetailsPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/extraction-field-details.page").then(m => ({ default: m.ExtractionFieldDetailsPage })))

const TemplateCreatePage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-create.page"))
const TemplateDetailsPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-details.page"))
const TemplateEditPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-edit.page"))
const TemplateFieldEditPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/templates/template-field-edit.page"))

const DerivedTemplateCreatePage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/derived/derived-template-create.page"))
const DerivedTemplateDetailsPage = React.lazy(() => import("./pages/platform-standard-content/extraction-management/derived/derived-template-details.page"))
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
                      <Route path="validation-rules/:code" element={<ValidationRuleDetail />} />
                      <Route path="validation-rules/:code/edit" element={<ValidationRuleFormPage mode="edit" />} />
                      <Route path="normalization-rules/create" element={<NormalizationRuleFormPage mode="create" />} />
                      <Route path="normalization-rules/:code" element={<NormalizationRuleDetail />} />
                      <Route path="normalization-rules/:code/edit" element={<NormalizationRuleFormPage mode="edit" />} />

                      <Route path="extraction-management/fields/create" element={<ExtractionFieldFormPage mode="create" />} />
                      <Route path="extraction-management/fields/:fieldId" element={<ExtractionFieldDetailsPage />} />
                      <Route path="extraction-management/fields/:fieldId/edit" element={<ExtractionFieldFormPage mode="edit" />} />
                        <Route path="extraction-management/templates/new" element={<React.Suspense fallback={null}><TemplateCreatePage /></React.Suspense>} />
                        <Route path="extraction-management/templates/:templateCode" element={<React.Suspense fallback={null}><TemplateDetailsPage /></React.Suspense>} />
                        <Route path="extraction-management/templates/:templateCode/edit" element={<React.Suspense fallback={null}><TemplateEditPage /></React.Suspense>} />
                        <Route path="extraction-management/templates/:templateCode/fields/:fieldId/edit" element={<React.Suspense fallback={null}><TemplateFieldEditPage /></React.Suspense>} />

                      <Route path="extraction-management/derived/new" element={<React.Suspense fallback={null}><DerivedTemplateCreatePage /></React.Suspense>} />
                      <Route path="extraction-management/derived/:derivedTemplateId" element={<React.Suspense fallback={null}><DerivedTemplateDetailsPage /></React.Suspense>} />
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
          <Route path="plan/:id" element={<PlanDetail />} />
          <Route path="plan/:id/edit" element={<EditPlan />} />
        </Route>

        <Route path="*" element={<Navigate to="/organizations" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

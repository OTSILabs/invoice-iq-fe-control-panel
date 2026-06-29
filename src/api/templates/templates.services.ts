import {
  compactParams,
  requestApiData,
  type ApiParams,
  type ApiRecord,
} from "@/api/api.helpers";

import type {
  ActiveToggleRequest,
  CustomFieldRequest,
  CustomFieldUpdateRequest,
  DeleteResponse,
  ExtractionFieldListResponse,
  ExtractionFieldResponse,
  ExtractionFieldsListParams,
  ExtractionTemplateCloneRequest,
  ExtractionTemplateCreateRequest,
  ExtractionTemplateListResponse,
  ExtractionTemplateResponse,
  ExtractionTemplatesListParams,
  ExtractionTemplateUpdateRequest,
  FieldCatalogsResponse,
  FieldCategoriesListParams,
  FieldCategoryCreateRequest,
  FieldCategoryFieldsResponse,
  FieldCategoryListResponse,
  FieldCategoryResponse,
  FieldCategoryUpdateRequest,
  TemplateAddFieldRequest,
  TemplateFieldOrderRequest,
  TemplateMembershipUpdateRequest,
  TemplatePathId,
} from "./templates.types";

const pathId = (value: TemplatePathId) => encodeURIComponent(String(value));

export const templateEndpoints = {
  fields: "/api/extraction-template/fields",
  field: (fieldId: TemplatePathId) =>
    `/api/platform-standard-content/extraction-fields/${pathId(fieldId)}`,
  fieldActive: (fieldId: TemplatePathId) =>
    `/api/extraction-template/fields/${pathId(fieldId)}/active`,
  fieldCategories: "/api/extraction-template/field-categories",
  fieldCategory: (fieldCategoryCode: TemplatePathId) =>
    `/api/extraction-template/field-categories/${pathId(fieldCategoryCode)}`,
  fieldCategoryFields: (fieldCategoryCode: TemplatePathId) =>
    `/api/extraction-template/field-categories/${pathId(fieldCategoryCode)}/fields`,
  templates: "/api/platform-standard-content/extraction-templates",
  template: (templateId: TemplatePathId) =>
    `/api/platform-standard-content/extraction-templates/${pathId(templateId)}`,
  templateClone: (templateId: TemplatePathId) =>
    `/api/extraction-template/templates/${pathId(templateId)}/clone`,
  templateActive: (templateId: TemplatePathId) =>
    `/api/extraction-template/templates/${pathId(templateId)}/active`,
  templateFieldOrder: (templateId: TemplatePathId) =>
    `/api/extraction-template/templates/${pathId(templateId)}/field-order`,
  templateFields: (templateId: TemplatePathId) =>
    `/api/extraction-template/templates/${pathId(templateId)}/fields`,
  templateField: (templateId: TemplatePathId, fieldId: TemplatePathId) =>
    `/api/extraction-template/templates/${pathId(templateId)}/fields/${pathId(
      fieldId,
    )}`,
  catalogs: "/api/extraction-template/catalogs",
} as const;

const getRequest = <TResponse>(url: string, params: ApiParams = {}) =>
  requestApiData<TResponse>({
    method: "GET",
    url,
    params: compactParams(params),
  });

const writeRequest = <TResponse>(
  method: "POST" | "PATCH",
  url: string,
  data: ApiRecord,
) =>
  requestApiData<TResponse>({
    method,
    url,
    data,
  });

const deleteRequest = <TResponse>(url: string) =>
  requestApiData<TResponse>({
    method: "DELETE",
    url,
  });

const listExtractionFields = (params: ExtractionFieldsListParams = {}) =>
  getRequest<ExtractionFieldListResponse>(templateEndpoints.fields, params);

const createCustomField = (data: CustomFieldRequest) =>
  writeRequest<ExtractionFieldResponse>("POST", templateEndpoints.fields, data);

const getExtractionField = (fieldId: TemplatePathId) =>
  getRequest<ExtractionFieldResponse>(templateEndpoints.field(fieldId));

const updateCustomField = (
  fieldId: TemplatePathId,
  data: CustomFieldUpdateRequest,
) =>
  writeRequest<ExtractionFieldResponse>(
    "PATCH",
    templateEndpoints.field(fieldId),
    data,
  );

const deleteCustomField = (fieldId: TemplatePathId) =>
  deleteRequest<DeleteResponse>(templateEndpoints.field(fieldId));

const setCustomFieldActive = (
  fieldId: TemplatePathId,
  data: ActiveToggleRequest,
) =>
  writeRequest<ExtractionFieldResponse>(
    "PATCH",
    templateEndpoints.fieldActive(fieldId),
    data,
  );

const listFieldCategories = (params: FieldCategoriesListParams = {}) =>
  getRequest<FieldCategoryListResponse>(
    templateEndpoints.fieldCategories,
    params,
  );

const createFieldCategory = (data: FieldCategoryCreateRequest) =>
  writeRequest<FieldCategoryResponse>(
    "POST",
    templateEndpoints.fieldCategories,
    data,
  );

const getFieldCategory = (fieldCategoryCode: TemplatePathId) =>
  getRequest<FieldCategoryResponse>(
    templateEndpoints.fieldCategory(fieldCategoryCode),
  );

const updateFieldCategory = (
  fieldCategoryCode: TemplatePathId,
  data: FieldCategoryUpdateRequest,
) =>
  writeRequest<FieldCategoryResponse>(
    "PATCH",
    templateEndpoints.fieldCategory(fieldCategoryCode),
    data,
  );

const deleteFieldCategory = (fieldCategoryCode: TemplatePathId) =>
  deleteRequest<DeleteResponse>(
    templateEndpoints.fieldCategory(fieldCategoryCode),
  );

const listFieldCategoryFields = (fieldCategoryCode: TemplatePathId) =>
  getRequest<FieldCategoryFieldsResponse>(
    templateEndpoints.fieldCategoryFields(fieldCategoryCode),
  );

const listTemplates = (params: ExtractionTemplatesListParams = {}) =>
  getRequest<ExtractionTemplateListResponse>(templateEndpoints.templates, params);

const createTemplate = (data: ExtractionTemplateCreateRequest) =>
  writeRequest<ExtractionTemplateResponse>(
    "POST",
    templateEndpoints.templates,
    data,
  );

const getTemplate = (templateId: TemplatePathId) =>
  getRequest<ExtractionTemplateResponse>(templateEndpoints.template(templateId));

const updateTemplate = (
  templateId: TemplatePathId,
  data: ExtractionTemplateUpdateRequest,
) =>
  writeRequest<ExtractionTemplateResponse>(
    "PATCH",
    templateEndpoints.template(templateId),
    data,
  );

const deleteTemplate = (templateId: TemplatePathId) =>
  deleteRequest<DeleteResponse>(templateEndpoints.template(templateId));

const cloneTemplate = (
  templateId: TemplatePathId,
  data: ExtractionTemplateCloneRequest,
) =>
  writeRequest<ExtractionTemplateResponse>(
    "POST",
    templateEndpoints.templateClone(templateId),
    data,
  );

const setTemplateActive = (
  templateId: TemplatePathId,
  data: ActiveToggleRequest,
) =>
  writeRequest<ExtractionTemplateResponse>(
    "PATCH",
    templateEndpoints.templateActive(templateId),
    data,
  );

const reorderTemplateFields = (
  templateId: TemplatePathId,
  data: TemplateFieldOrderRequest,
) =>
  writeRequest<ExtractionTemplateResponse>(
    "PATCH",
    templateEndpoints.templateFieldOrder(templateId),
    data,
  );

const addTemplateField = (
  templateId: TemplatePathId,
  data: TemplateAddFieldRequest,
) =>
  writeRequest<ExtractionTemplateResponse>(
    "POST",
    templateEndpoints.templateFields(templateId),
    data,
  );

const updateTemplateFieldMembership = (
  templateId: TemplatePathId,
  fieldId: TemplatePathId,
  data: TemplateMembershipUpdateRequest,
) =>
  writeRequest<ExtractionTemplateResponse>(
    "PATCH",
    templateEndpoints.templateField(templateId, fieldId),
    data,
  );

const removeTemplateField = (
  templateId: TemplatePathId,
  fieldId: TemplatePathId,
) =>
  deleteRequest<ExtractionTemplateResponse>(
    templateEndpoints.templateField(templateId, fieldId),
  );

const getFieldCatalogs = () =>
  getRequest<FieldCatalogsResponse>(templateEndpoints.catalogs);

export const templatesService = {
  listExtractionFields,
  getTemplateFields: listExtractionFields,
  createCustomField,
  createTemplateField: createCustomField,
  getExtractionField,
  getTemplateFieldByCode: getExtractionField,
  updateCustomField,
  updateTemplateField: updateCustomField,
  deleteCustomField,
  deleteTemplateField: deleteCustomField,
  setCustomFieldActive,

  listFieldCategories,
  createFieldCategory,
  getFieldCategory,
  updateFieldCategory,
  deleteFieldCategory,
  listFieldCategoryFields,

  listTemplates,
  getTemplates: listTemplates,
  createTemplate,
  getTemplate,
  getTemplateByCode: getTemplate,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
  setTemplateActive,
  reorderTemplateFields,
  updateTemplateSortOrder: reorderTemplateFields,
  addTemplateField,
  updateTemplateFieldMembership,
  removeTemplateField,
  getFieldCatalogs,
};

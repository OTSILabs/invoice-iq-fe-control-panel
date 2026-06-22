import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiRecord } from "@/api/api.helpers";

import { templatesService } from "./templates.services";
import type {
  ActiveToggleRequest,
  CustomFieldRequest,
  CustomFieldUpdateRequest,
  ExtractionFieldsListParams,
  ExtractionTemplateCloneRequest,
  ExtractionTemplateCreateRequest,
  ExtractionTemplatesListParams,
  ExtractionTemplateUpdateRequest,
  FieldCategoriesListParams,
  TemplateFieldOrderRequest,
  TemplateMembershipUpdateRequest,
  TemplatePathId,
} from "./templates.types";

type QueryOptions = { enabled?: boolean };
type TemplateIdInput = {
  templateId?: TemplatePathId | null;
  templateCode?: TemplatePathId | null;
};
type FieldIdInput = {
  fieldId?: TemplatePathId | null;
  fieldCode?: TemplatePathId | null;
};

export const templateQueryKeys = {
  templatesRoot: () => ["templates"] as const,
  templates: (params: ExtractionTemplatesListParams = {}) =>
    ["templates", "list", params] as const,
  template: (templateId: TemplatePathId) =>
    ["templates", "detail", templateId] as const,
  fieldsRoot: () => ["template-fields"] as const,
  fields: (params: ExtractionFieldsListParams = {}) =>
    ["template-fields", "list", params] as const,
  field: (fieldId: TemplatePathId) =>
    ["template-fields", "detail", fieldId] as const,
  fieldCategoriesRoot: () => ["template-field-categories"] as const,
  fieldCategories: (params: FieldCategoriesListParams = {}) =>
    ["template-field-categories", "list", params] as const,
  fieldCategory: (fieldCategoryCode: TemplatePathId) =>
    ["template-field-categories", "detail", fieldCategoryCode] as const,
  fieldCategoryFields: (fieldCategoryCode: TemplatePathId) =>
    ["template-field-categories", "fields", fieldCategoryCode] as const,
  catalogs: () => ["template-field-catalogs"] as const,
};

const resolveTemplateId = ({ templateId, templateCode }: TemplateIdInput) => {
  const resolvedId = templateId ?? templateCode;

  if (!resolvedId) {
    throw new Error("Template ID is required");
  }

  return resolvedId;
};

const resolveFieldId = ({ fieldId, fieldCode }: FieldIdInput) => {
  const resolvedId = fieldId ?? fieldCode;

  if (!resolvedId) {
    throw new Error("Field ID is required");
  }

  return resolvedId;
};


const useExtractionTemplate = (
  templateCode: TemplatePathId | null | undefined,
  options: QueryOptions = {},
) =>
  useQuery({
    queryKey: templateQueryKeys.template(templateCode ?? ""),
    queryFn: () =>
      templatesService.getTemplate(templateCode as TemplatePathId),
    enabled: !!templateCode && (options.enabled ?? true),
  });

export const useTemplateByCode = (
  templateCode: TemplatePathId | null | undefined,
  options: QueryOptions = {},
) => useExtractionTemplate(templateCode, options);

export const useFieldCategoriesList = (
  params: FieldCategoriesListParams = {},
  options: QueryOptions = {},
) =>
  useQuery({
    queryKey: templateQueryKeys.fieldCategories(params),
    queryFn: () => templatesService.listFieldCategories(params),
    ...options,
  });



export const useFieldCatalogs = (options: QueryOptions = {}) =>
  useQuery({
    queryKey: templateQueryKeys.catalogs(),
    queryFn: templatesService.getFieldCatalogs,
    ...options,
  });

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExtractionTemplateCreateRequest | ApiRecord) =>
      templatesService.createTemplate(data as ExtractionTemplateCreateRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.templatesRoot(),
      });
      toast.success("Template created successfully");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to create template"),
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      templateCode,
      templateId,
    }: TemplateIdInput & {
      data: ExtractionTemplateUpdateRequest | ApiRecord;
    }) => {
      const resolvedTemplateId = resolveTemplateId({
        templateId,
        templateCode,
      });

      return templatesService.updateTemplate(
        resolvedTemplateId,
        data as ExtractionTemplateUpdateRequest,
      );
    },
    onSuccess: (_, variables) => {
      const resolvedTemplateId = variables.templateId ?? variables.templateCode;

      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.templatesRoot(),
      });
      if (resolvedTemplateId) {
        queryClient.invalidateQueries({
          queryKey: templateQueryKeys.template(resolvedTemplateId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.fieldsRoot(),
      });
      toast.success("Template updated successfully");
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: TemplatePathId) =>
      templatesService.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.templatesRoot(),
      });
      toast.success("Template deleted successfully");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to delete template"),
  });
};

export const useCloneTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      templateId,
      templateCode,
    }: TemplateIdInput & {
      data: ExtractionTemplateCloneRequest | ApiRecord;
    }) =>
      templatesService.cloneTemplate(
        resolveTemplateId({ templateId, templateCode }),
        data as ExtractionTemplateCloneRequest,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.templatesRoot(),
      });
      toast.success("Template cloned successfully");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to clone template"),
  });
};

export const useSetTemplateActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      templateId,
      templateCode,
    }: TemplateIdInput & { data: ActiveToggleRequest }) => {
      const resolvedTemplateId = resolveTemplateId({
        templateId,
        templateCode,
      });

      return templatesService.setTemplateActive(resolvedTemplateId, data);
    },
    onSuccess: (_, variables) => {
      const resolvedTemplateId = variables.templateId ?? variables.templateCode;

      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.templatesRoot(),
      });
      if (resolvedTemplateId) {
        queryClient.invalidateQueries({
          queryKey: templateQueryKeys.template(resolvedTemplateId),
        });
      }
      toast.success("Template status updated successfully");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update template status"),
  });
};

export const useUpdateTemplateSortOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      fieldCodes,
      fieldIds,
      templateCode,
      templateId,
    }: TemplateIdInput & {
      data?: TemplateFieldOrderRequest;
      fieldCodes?: string[];
      fieldIds?: string[];
    }) => {
      const resolvedTemplateId = resolveTemplateId({
        templateId,
        templateCode,
      });

      return templatesService.reorderTemplateFields(
        resolvedTemplateId,
        data ?? { field_ids: fieldIds ?? fieldCodes ?? [] },
      );
    },
    onMutate: () => {
      const toastId = toast.loading("Saving field order...", {
        closeButton: false,
      });

      return { toastId };
    },
    onSuccess: (_, variables, context) => {
      const resolvedTemplateId = variables.templateId ?? variables.templateCode;

      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.templatesRoot(),
      });
      if (resolvedTemplateId) {
        queryClient.invalidateQueries({
          queryKey: templateQueryKeys.template(resolvedTemplateId),
        });
      }
      toast.success("Field order saved successfully", {
        id: context?.toastId,
        closeButton: true,
      });
    },
    onError: (error: Error, _variables, context) => {
      toast.error(error.message || "Failed to save field order", {
        id: context?.toastId,
        closeButton: true,
      });
    },
  });
};



export const useUpdateTemplateFieldMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      fieldCode,
      fieldId,
      templateCode,
      templateId,
    }: TemplateIdInput &
      FieldIdInput & { data: TemplateMembershipUpdateRequest | ApiRecord }) => {
      const resolvedTemplateId = resolveTemplateId({
        templateId,
        templateCode,
      });
      const resolvedFieldId = resolveFieldId({ fieldId, fieldCode });

      return templatesService.updateTemplateFieldMembership(
        resolvedTemplateId,
        resolvedFieldId,
        data as TemplateMembershipUpdateRequest,
      );
    },
    onSuccess: (_, variables) => {
      const resolvedTemplateId = variables.templateId ?? variables.templateCode;

      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.templatesRoot(),
      });
      if (resolvedTemplateId) {
        queryClient.invalidateQueries({
          queryKey: templateQueryKeys.template(resolvedTemplateId),
        });
      }
      toast.success("Template field updated successfully");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update template field"),
  });
};



export const useCreateTemplateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomFieldRequest | ApiRecord) =>
      templatesService.createCustomField(data as CustomFieldRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.fieldsRoot(),
      });
      toast.success("Field created successfully");
    },
  });
};

export const useUpdateTemplateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      fieldCode,
      fieldId,
    }: FieldIdInput & { data: CustomFieldUpdateRequest | ApiRecord }) => {
      const resolvedFieldId = resolveFieldId({ fieldId, fieldCode });

      return templatesService.updateCustomField(
        resolvedFieldId,
        data as CustomFieldUpdateRequest,
      );
    },
    onSuccess: (_, variables) => {
      const resolvedFieldId = variables.fieldId ?? variables.fieldCode;

      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.fieldsRoot(),
      });
      if (resolvedFieldId) {
        queryClient.invalidateQueries({
          queryKey: templateQueryKeys.field(resolvedFieldId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: templateQueryKeys.templatesRoot(),
      });
      toast.success("Field updated successfully");
    },
  });
};



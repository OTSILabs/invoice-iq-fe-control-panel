const ROUTES = {
  DASHBOARD: "/organizations",
  TEMPLATES: "/platform-standard-content/extraction-management",
  TEMPLATE_CREATE: "/platform-standard-content/extraction-management/templates/new",
  TEMPLATE_DETAILS: "/platform-standard-content/extraction-management/templates/:templateCode",
  TEMPLATE_EDIT: "/platform-standard-content/extraction-management/templates/:templateCode/edit",
  TEMPLATE_FIELD_EDIT: "/platform-standard-content/extraction-management/templates/:templateCode/fields/:fieldId/edit",
  DERIVED_TEMPLATE_CREATE: "/platform-standard-content/extraction-management/derived/new",
  DERIVED_TEMPLATE_DETAILS: "/platform-standard-content/extraction-management/derived/:derivedTemplateId",
  DERIVED_TEMPLATE_EDIT: "/platform-standard-content/extraction-management/derived/:derivedTemplateId/edit",
} as const;

export const APP_ROUTES = {
  ...ROUTES,
  getRoute: (
    route: string,
    params: Record<string, string | number | null | undefined> = {},
  ) =>
    route
      .replace(/:([A-Za-z0-9_]+)/g, (_, key: string) =>
        params[key] === undefined || params[key] === null
          ? ""
          : String(params[key]),
      )
      .replace(/\[([A-Za-z0-9_]+)\]/g, (_, key: string) =>
        params[key] === undefined || params[key] === null
          ? ""
          : String(params[key]),
      ),
} as const;

import { APP_ROUTES } from "@/config/routes"
import type { BreadcrumbEntry } from "./AppBreadcrumb"

/**
 * Resolves a URL path into breadcrumb entries.
 * Handles static routes, dynamic org IDs, and UUID fallbacks.
 */
export function resolveBreadcrumbs(
  pathname: string
): BreadcrumbEntry[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbEntry[] = []
  let currentPath = ""

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const title = resolveSegmentTitle(segments, i, currentPath)
    
    // Custom link mapping for extraction management tabs to avoid non-existent routes
    let href = currentPath
    if (segments[i] === "templates" && i > 0 && segments[i - 1] === "extraction-management") {
      href = "/platform-standard-content/extraction-management?tab=templates"
    } else if (segments[i] === "fields" && i > 0 && segments[i - 1] === "extraction-management") {
      href = "/platform-standard-content/extraction-management?tab=fields"
    } else if (segments[i] === "derived" && i > 0 && segments[i - 1] === "extraction-management") {
      href = "/platform-standard-content/extraction-management?tab=derived"
    }

    breadcrumbs.push({ title, href, isLast: i === segments.length - 1 })
  }

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ title: "Home", href: "/", isLast: true })
  }

  return breadcrumbs
}

// Build a flat lookup map of all paths to routes once at module load time
const ROUTES_BY_PATH = new Map<string, any>()

function initializeRoutesMap() {
  for (const route of APP_ROUTES) {
    if (!ROUTES_BY_PATH.has(route.path)) {
      ROUTES_BY_PATH.set(route.path, route)
    }
    if (route.children) {
      for (const child of route.children) {
        if (!ROUTES_BY_PATH.has(child.path)) {
          ROUTES_BY_PATH.set(child.path, child)
        }
      }
    }
  }
}

initializeRoutesMap()

function findRouteByPath(path: string) {
  return ROUTES_BY_PATH.get(path) ?? null
}

function resolveSegmentTitle(
  segments: string[],
  index: number,
  currentPath: string
): string {
  // 1. Static route match (including children)
  const route = findRouteByPath(currentPath)
  if (route) {
    return route.title === "Manage Teams" ? "Team Members" : route.title
  }

  // 2. Dynamic org ID — resolve from cache, fallback to async
  const isOrgChild = index > 0 && segments[index - 1] === "organizations" && segments[index] !== "create"
  if (isOrgChild) {
    return `DYNAMIC_ORG_${segments[index]}`
  }

  // Dynamic data type — resolve from cache, fallback to code
  const isDataTypeChild = index > 0 && segments[index - 1] === "data-types"
  if (isDataTypeChild) {
    return `DYNAMIC_DATATYPE_${segments[index]}`
  }

  // Dynamic validation rule — resolve from cache, fallback to code
  const isValidationRuleChild = index > 0 && segments[index - 1] === "validation-rules"
  if (isValidationRuleChild) {
    return `DYNAMIC_VALIDATION_${segments[index]}`
  }

  // Dynamic normalization rule — resolve from cache, fallback to code
  const isNormalizationRuleChild = index > 0 && segments[index - 1] === "normalization-rules"
  if (isNormalizationRuleChild) {
    return `DYNAMIC_NORMALIZATION_${segments[index]}`
  }

  // Dynamic extraction template — resolve from cache, fallback to code/ID
  const isTemplateChild = index > 1 && segments[index - 1] === "templates" && segments[index - 2] === "extraction-management"
  if (isTemplateChild) {
    return `DYNAMIC_TEMPLATE_${segments[index]}`
  }

  // Dynamic extraction field — resolve from cache, fallback to ID
  const isFieldChild = index > 1 && segments[index - 1] === "fields" && segments[index - 2] === "extraction-management"
  if (isFieldChild) {
    return `DYNAMIC_FIELD_${segments[index]}`
  }

  // Dynamic derived template — resolve from cache, fallback to ID
  const isDerivedChild = index > 1 && segments[index - 1] === "derived" && segments[index - 2] === "extraction-management"
  if (isDerivedChild) {
    return `DYNAMIC_DERIVED_${segments[index]}`
  }

  // Dynamic reference list registry — resolve from cache
  const isReferenceRegistryChild = index > 0 && segments[index - 1] === "reference-lists"
  if (isReferenceRegistryChild) {
    return `DYNAMIC_REFERENCE_${segments[index]}`
  }

  // 3. UUID or long segment — collapse
  const raw = segments[index]
  if (/^[0-9a-fA-F-]{36}$/.test(raw) || raw.length > 20) return "View"

  // 4. Plain segment — capitalize
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

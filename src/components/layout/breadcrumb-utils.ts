import { APP_ROUTES } from "@/config/routes"
import type { QueryClient } from "@tanstack/react-query"
import type { BreadcrumbEntry } from "./AppBreadcrumb"

/**
 * Resolves a URL path into breadcrumb entries.
 * Handles static routes, dynamic org IDs, and UUID fallbacks.
 */
export function resolveBreadcrumbs(
  pathname: string,
  queryClient: QueryClient
): BreadcrumbEntry[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbEntry[] = []
  let currentPath = ""

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const title = resolveSegmentTitle(segments, i, currentPath, queryClient)
    breadcrumbs.push({ title, href: currentPath, isLast: i === segments.length - 1 })
  }

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ title: "Home", href: "/", isLast: true })
  }

  return breadcrumbs
}

function resolveSegmentTitle(
  segments: string[],
  index: number,
  currentPath: string,
  queryClient: QueryClient
): string {
  // 1. Static route match
  const route = APP_ROUTES.find((r) => r.path === currentPath)
  if (route) {
    return route.title === "Manage Teams" ? "Team Members" : route.title
  }

  // 2. Dynamic org ID — resolve from cache, fallback to async
  const isOrgChild = index > 0 && segments[index - 1] === "organizations"
  if (isOrgChild) {
    const cached = queryClient.getQueryData<{ name?: string }>(["organizations", segments[index]])
    return cached?.name ?? `DYNAMIC_ORG_${segments[index]}`
  }

  // 3. UUID or long segment — collapse
  const raw = segments[index]
  if (/^[0-9a-fA-F-]{36}$/.test(raw) || raw.length > 20) return "View"

  // 4. Plain segment — capitalize
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}
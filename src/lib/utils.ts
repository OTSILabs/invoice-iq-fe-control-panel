import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export function getInitials(name: string): string {
  if (!name) return ""
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}


import { APP_ROUTES } from "@/config/routes"
import type { QueryClient } from "@tanstack/react-query"

export interface BreadcrumbEntry {
  title: string
  href: string
  isLast: boolean
}

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

    breadcrumbs.push({
      title,
      href: currentPath,
      isLast: i === segments.length - 1,
    })
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
  // 1. Check static route registry first
  const route = APP_ROUTES.find((r) => r.path === currentPath)
  if (route) {
    return route.title === "Manage Teams" ? "Team Members" : route.title
  }

  // 2. Dynamic org ID under /organizations/:id
  const isOrgChild = index > 0 && segments[index - 1] === "organizations"
  if (isOrgChild) {
    const orgId = segments[index]
    const cached = queryClient.getQueryData<{ name?: string }>(["organizations", orgId])
    if (cached?.name) return cached.name
    return `DYNAMIC_ORG_${orgId}` // layout resolves this async
  }

  // 3. UUID or very long segment — collapse to "View"
  const raw = segments[index]
  const isUUID = /^[0-9a-fA-F-]{36}$/.test(raw)
  const isTooLong = raw.length > 20
  if (isUUID || isTooLong) return "View"

  // 4. Capitalize plain segment
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

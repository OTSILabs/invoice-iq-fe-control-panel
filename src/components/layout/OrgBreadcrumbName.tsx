import { useQuery } from "@tanstack/react-query"
import { organizationsService } from "@/api/services/organizations.service"

interface Props {
  id: string
  fallback?: string
}

/**
 * Resolves an org ID to its display name via React Query cache or API.
 * Used inside breadcrumbs for dynamic /organizations/:id routes.
 */
export function OrgBreadcrumbName({ id, fallback = "Loading..." }: Props) {
  const { data } = useQuery({
    queryKey: ["organizations", id],
    queryFn: () => organizationsService.getById(id),
    staleTime: 1000 * 60 * 5,
  })

  return <>{data?.name ?? fallback}</>
}

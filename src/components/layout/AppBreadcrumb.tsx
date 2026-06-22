import { Fragment } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { organizationsService } from "@/api/services/organizations.service"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface BreadcrumbEntry {
  title: string
  href: string
  isLast: boolean
}

interface Props {
  breadcrumbs: BreadcrumbEntry[]
}

/**
 * Renders the full breadcrumb trail.
 * Handles static titles and dynamic org name resolution.
 */
export function AppBreadcrumb({ breadcrumbs }: Props) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>
                  <CrumbLabel title={crumb.title} />
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href}>
                    <CrumbLabel title={crumb.title} />
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function CrumbLabel({ title }: { title: string }) {
  if (title.startsWith("DYNAMIC_ORG_")) {
    return <OrgName id={title.replace("DYNAMIC_ORG_", "")} />
  }
  return <>{title}</>
}

function OrgName({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ["organizations", id],
    queryFn: () => organizationsService.getById(id),
    staleTime: 1000 * 60 * 5,
  })
  return <>{data?.name ?? "Loading..."}</>
}

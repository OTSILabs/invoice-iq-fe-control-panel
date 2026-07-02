import type { Props } from "@/types";
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

import { templatesService } from "@/api/templates/templates.services"
import { datatypeService } from "@/api/services/data-types.service"
import { derivedTemplatesService } from "@/api/services/derived-templates.service"
import { validationRulesService } from "@/api/services/validation-rules.service"
import { normalizationRulesService } from "@/api/services/normalization-rules.service"
import { referenceListsService } from "@/api/services/reference-lists.service"





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
  if (title.startsWith("DYNAMIC_DATATYPE_")) {
    return <DataTypeName code={title.replace("DYNAMIC_DATATYPE_", "")} />
  }
  if (title.startsWith("DYNAMIC_VALIDATION_")) {
    return <ValidationRuleName code={title.replace("DYNAMIC_VALIDATION_", "")} />
  }
  if (title.startsWith("DYNAMIC_NORMALIZATION_")) {
    return <NormalizationRuleName code={title.replace("DYNAMIC_NORMALIZATION_", "")} />
  }
  if (title.startsWith("DYNAMIC_TEMPLATE_")) {
    return <TemplateName code={title.replace("DYNAMIC_TEMPLATE_", "")} />
  }
  if (title.startsWith("DYNAMIC_FIELD_")) {
    return <FieldName code={title.replace("DYNAMIC_FIELD_", "")} />
  }
  if (title.startsWith("DYNAMIC_DERIVED_")) {
    return <DerivedTemplateName code={title.replace("DYNAMIC_DERIVED_", "")} />
  }
  if (title.startsWith("DYNAMIC_REFERENCE_")) {
    return <ReferenceListName code={title.replace("DYNAMIC_REFERENCE_", "")} />
  }
  return <>{title}</>
}

function OrgName({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ["organizations", id],
    queryFn: () => organizationsService.getById(id),
    enabled: !!id && id !== "create",
    staleTime: 1000 * 60 * 5,
  })
  if (id === "create") return <>Create</>
  return <>{data?.name ?? "Loading..."}</>
}

function DataTypeName({ code }: { code: string }) {
  const { data: cachedList } = useQuery<any[]>({
    queryKey: ["data-types"],
    enabled: false,
  })
  const matched = cachedList?.find((d) => d.data_type_code === code)

  const { data } = useQuery({
    queryKey: ["data-type", code],
    queryFn: () => datatypeService.getDataType(code),
    enabled: !matched?.display_label && !!code,
    staleTime: 1000 * 60 * 5,
  })

  const label = matched?.display_label || data?.display_label || code
  return <>{label}</>
}

function ValidationRuleName({ code }: { code: string }) {
  const { data: cachedList } = useQuery<any[]>({
    queryKey: ["validation-rules"],
    enabled: false,
  })
  const matched = cachedList?.find((v) => v.rule_code === code)

  const { data } = useQuery({
    queryKey: ["validation-rule", code],
    queryFn: () => validationRulesService.getValidationRule(code),
    enabled: !matched?.display_label && !!code,
    staleTime: 1000 * 60 * 5,
  })

  const label = matched?.display_label || data?.display_label || code
  return <>{label}</>
}

function NormalizationRuleName({ code }: { code: string }) {
  const { data: cachedList } = useQuery<any[]>({
    queryKey: ["normalization-rules"],
    enabled: false,
  })
  const matched = cachedList?.find((n) => n.rule_code === code)

  const { data } = useQuery({
    queryKey: ["normalization-rule", code],
    queryFn: () => normalizationRulesService.getNormalizationRule(code),
    enabled: !matched?.display_label && !!code,
    staleTime: 1000 * 60 * 5,
  })

  const label = matched?.display_label || data?.display_label || code
  return <>{label}</>
}

function TemplateName({ code }: { code: string }) {
  const { data: cachedList } = useQuery<any[]>({
    queryKey: ["extraction-templates"],
    enabled: false,
  })
  const matched = cachedList?.find((t) => t.template_id === code)

  const { data } = useQuery({
    queryKey: ["templates", "detail", code],
    queryFn: () => templatesService.getTemplate(code),
    enabled: !matched?.name && !!code,
    staleTime: 1000 * 60 * 5,
  })

  const name = matched?.name || data?.name || code
  return <>{name}</>
}

function FieldName({ code }: { code: string }) {
  const { data: cachedList } = useQuery<any[]>({
    queryKey: ["extraction-fields"],
    enabled: false,
  })
  const matched = cachedList?.find((f) => f.field_id === code)

  const { data } = useQuery({
    queryKey: ["template-fields", "detail", code],
    queryFn: () => templatesService.getExtractionField(code),
    enabled: !matched?.field_label && !!code,
    staleTime: 1000 * 60 * 5,
  })

  const label = matched?.field_label || data?.field_label || code
  return <>{label}</>
}

function DerivedTemplateName({ code }: { code: string }) {
  const { data: cachedList } = useQuery<any[]>({
    queryKey: ["derived-templates"],
    enabled: false,
  })
  const matched = cachedList?.find((d) => d.derived_template_id === code)

  const { data } = useQuery({
    queryKey: ["derived-templates", code],
    queryFn: () => derivedTemplatesService.get(code),
    enabled: !matched?.name && !!code,
    staleTime: 1000 * 60 * 5,
  })

  const name = matched?.name || data?.name || code
  return <>{name}</>
}

function ReferenceListName({ code }: { code: string }) {
  const { data: cachedList } = useQuery<any[]>({
    queryKey: ["reference-lists"],
    enabled: false,
  })
  const matched = cachedList?.find((r) => r.registry_key === code)

  const { data } = useQuery({
    queryKey: ["reference-lists", code],
    queryFn: () => referenceListsService.get(code),
    enabled: !matched?.display_label && !!code,
    staleTime: 1000 * 60 * 5,
  })

  const label = matched?.display_label || data?.display_label || code
  return <>{label}</>
}

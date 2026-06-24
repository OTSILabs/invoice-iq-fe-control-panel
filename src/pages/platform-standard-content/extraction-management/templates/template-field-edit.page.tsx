import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";


import type { ExtractionFieldResponse } from "@/api/templates/templates.types";
import { useTemplateByCode } from "@/api/templates/templates.hooks";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import {
  PageDescription,
  PageDescriptiveSection,
  PageTitle,
} from "@/components/invoice-ui/typography";
import { buildTemplateFieldDialogRecord } from "@/components/invoice-ui/templates/field-management-utils";
import { TemplateFieldFormSurface } from "@/components/invoice-ui/templates/template-field-form-dialog";
import {
  getFieldCode,
  getFieldLabel,
  getTemplateName,
  normalizeTemplateDetail,
  resolveTemplateFields,
} from "@/components/invoice-ui/templates/template-data";
import { SectionCard, EmptyState } from "@/components/invoice-ui/design-system";
import { PageLoader } from "@/components/layout/PageLoader";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { APP_ROUTES } from "@/config/routes-helper";

export default function TemplateFieldEditPage() {
  const { templateCode = "", fieldId = "" } = useParams();
  const navigate = useNavigate();
  const { isMounted } = useUser();
  const templateQuery = useTemplateByCode(templateCode);
  const template = normalizeTemplateDetail(templateQuery.data);
  const fields = resolveTemplateFields<ExtractionFieldResponse>(template);
  const field = fields.find((item) => getFieldCode(item) === fieldId) || null;
  const backUrl = APP_ROUTES.getRoute(APP_ROUTES.TEMPLATE_DETAILS, { templateCode }) + "?tab=fields";

  if (!isMounted) {
    return null;
  }

  if (templateQuery.isLoading) {
    return (
      <PageContainers>
        <PageLoader className="min-h-[calc(100svh-10rem)]" />
      </PageContainers>
    );
  }

  if (templateQuery.isError || !field) {
    return (
      <PageContainers>
        <EmptyState
          title="Field not found"
          description="The selected template field is not available."
          actions={
            <Button variant="outline" asChild>
              <Link to={backUrl}>
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Back to Template Fields
              </Link>
            </Button>
          }
        />
      </PageContainers>
    );
  }

  return (
    <PageContainers backgroundClassName="overflow-visible">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageDescriptiveSection>
          <PageTitle title="Edit Template Field" />
          <PageDescription description={`${getTemplateName(template)} / ${getFieldLabel(field)}`} />
        </PageDescriptiveSection>

        <Button variant="outline" asChild>
          <Link to={backUrl}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to Template Fields
          </Link>
        </Button>
      </div>

      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Field configuration
          </span>
        }
        className="max-w-5xl overflow-hidden p-0"
        contentClassName="p-0"
      >
        <TemplateFieldFormSurface
          mode="edit"
          template={template}
          field={buildTemplateFieldDialogRecord(field)}
          onCancel={() => navigate(backUrl)}
          onSuccess={() => navigate(backUrl)}
        />
      </SectionCard>
    </PageContainers>
  );
}

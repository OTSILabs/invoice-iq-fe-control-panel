import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import type { TemplateRecord } from "@/api/templates/templates.types";
import { useTemplateByCode } from "@/api/templates/templates.hooks";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { PageLoader } from "@/components/layout/PageLoader";
import {
  PageDescription,
  PageDescriptiveSection,
  PageTitle,
} from "@/components/invoice-ui/typography";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { APP_ROUTES } from "@/config/routes-helper";

import {
  getTemplateName,
  normalizeTemplateDetail,
} from "../_shared/record-utils";
import { TemplateForm } from "./template-form";

export default function TemplateEditPage() {
  const { templateCode = "" } = useParams();
  const navigate = useNavigate();
  const { isMounted } = useUser();
  const templateQuery = useTemplateByCode(templateCode);

  const template = normalizeTemplateDetail(templateQuery.data) as TemplateRecord;

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

  return (
    <PageContainers backgroundClassName="overflow-visible">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageDescriptiveSection>
          <PageTitle title="Edit Template" />
          <PageDescription description={getTemplateName(template)} />
        </PageDescriptiveSection>

        <Button variant="outline" asChild>
          <Link to={APP_ROUTES.TEMPLATES}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to Templates
          </Link>
        </Button>
      </div>

      <TemplateForm
        mode="edit"
        template={template}
        onCancel={() => navigate(APP_ROUTES.TEMPLATES)}
        onSuccess={() => navigate(APP_ROUTES.TEMPLATES)}
      />
    </PageContainers>
  );
}

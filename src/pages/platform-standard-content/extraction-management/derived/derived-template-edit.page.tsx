import { PageMetadata } from "@/components/layout/PageMetadata"
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
import { useDerivedTemplate } from "@/api/hooks/useDerivedTemplates";

import { DerivedTemplateForm } from "./derived-template-form";

export default function DerivedTemplateEditPage() {
  const { derivedTemplateId = "" } = useParams();
  const navigate = useNavigate();
  const { isMounted } = useUser();
  const templateQuery = useDerivedTemplate(derivedTemplateId);

  const backUrl = APP_ROUTES.TEMPLATES + "?tab=derived";

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
      <PageMetadata title="Edit Derived Template" description="Configure derived template settings." keywords="edit derived template, custom bindings" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageDescriptiveSection>
          <PageTitle title="Edit Derived Template" />
          <PageDescription description={templateQuery.data?.name || derivedTemplateId} />
        </PageDescriptiveSection>

        <Button variant="outline" asChild>
          <Link to={backUrl}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to Extraction Management
          </Link>
        </Button>
      </div>

      <DerivedTemplateForm
        mode="edit"
        template={templateQuery.data}
        onCancel={() => navigate(backUrl)}
        onSuccess={() => navigate(backUrl)}
      />
    </PageContainers>
  );
}
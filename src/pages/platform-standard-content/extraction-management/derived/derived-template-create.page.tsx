import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { PageContainers } from "@/components/invoice-ui/page-containers";
import {
  PageDescription,
  PageDescriptiveSection,
  PageTitle,
} from "@/components/invoice-ui/typography";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { APP_ROUTES } from "@/config/routes-helper";

import { DerivedTemplateForm } from "./derived-template-form";

export default function DerivedTemplateCreatePage() {
  const navigate = useNavigate();
  const { isMounted } = useUser();

  const backUrl = APP_ROUTES.TEMPLATES + "?tab=derived";

  if (!isMounted) {
    return null;
  }

  return (
    <PageContainers backgroundClassName="overflow-visible">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageDescriptiveSection>
          <PageTitle title="Derive Template" />
          <PageDescription description="Derive a layout template from a standard base template." />
        </PageDescriptiveSection>

        <Button variant="outline" asChild>
          <Link to={backUrl}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to Extraction Management
          </Link>
        </Button>
      </div>

      <DerivedTemplateForm
        mode="create"
        onCancel={() => navigate(backUrl)}
        onSuccess={() => navigate(backUrl)}
      />
    </PageContainers>
  );
}

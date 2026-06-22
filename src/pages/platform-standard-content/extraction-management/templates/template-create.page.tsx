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

import { TemplateForm } from "./template-form";

export default function TemplateCreatePage() {
  const navigate = useNavigate();
  const { isMounted } = useUser();

  if (!isMounted) {
    return null;
  }

  return (
    <PageContainers backgroundClassName="overflow-visible">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageDescriptiveSection>
          <PageTitle title="Create Template" />
          <PageDescription description="Create an invoice extraction template and choose the fields it should use." />
        </PageDescriptiveSection>

        <Button variant="outline" asChild>
          <Link to={APP_ROUTES.TEMPLATES}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to Templates
          </Link>
        </Button>
      </div>

      <TemplateForm
        mode="create"
        onCancel={() => navigate(APP_ROUTES.TEMPLATES)}
        onSuccess={() => navigate(APP_ROUTES.TEMPLATES)}
      />
    </PageContainers>
  );
}

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCard } from "@/components/invoice-ui/design-system";

export default function DerivedTemplateDetailsPage() {
  const { derivedTemplateId = "" } = useParams();
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

  const template = templateQuery.data;

  return (
    <PageContainers backgroundClassName="overflow-visible">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageDescriptiveSection>
          <PageTitle title="Derived Template Details" />
          <PageDescription description={template?.name || derivedTemplateId} />
        </PageDescriptiveSection>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={backUrl}>
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/platform-standard-content/extraction-management/derived/${derivedTemplateId}/edit`}>
              <Edit2 className="size-4 mr-2" />
              Edit Template
            </Link>
          </Button>
        </div>
      </div>

      <SectionCard contentClassName="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Derived Template ID</div>
            <div className="mt-1 text-sm">{template?.derived_template_id}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">ERP Type</div>
            <div className="mt-1 text-sm">{template?.erp_type || "—"}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Document Type Code</div>
            <div className="mt-1 text-sm">{template?.document_type_code || "—"}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <div className="mt-1 text-sm">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  template?.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {template?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Name</div>
            <div className="mt-1 text-sm">{template?.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Description</div>
            <div className="mt-1 text-sm">{template?.description || "—"}</div>
          </div>
        </div>
      </SectionCard>

      {template?.base_template && (
        <Card className="surface-card mt-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Base Template Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <div>
                  <div className="text-sm font-medium text-muted-foreground">Base Template Name</div>
                  <div className="mt-1 text-sm">{template.base_template.name}</div>
               </div>
               <div>
                  <div className="text-sm font-medium text-muted-foreground">Base Template Description</div>
                  <div className="mt-1 text-sm">{template.base_template.description || "—"}</div>
               </div>
               <div>
                  <div className="text-sm font-medium text-muted-foreground">Version Number</div>
                  <div className="mt-1 text-sm">{template.base_template.version_no}</div>
               </div>
             </div>
          </CardContent>
        </Card>
      )}

    </PageContainers>
  );
}

import { Loader2Icon, PlusIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitFooterProps {
  isPending: boolean;
  isEditMode: boolean;
  isFormReadyToSubmit: boolean;
  onSubmitClick: () => void;
}

export default function TemplateFieldDialogSubmit({
  isPending,
  isEditMode,
  isFormReadyToSubmit,
  onSubmitClick,
}: SubmitFooterProps) {
  return (
    <div className="ml-auto">
      <Button type="button" disabled={isPending || !isFormReadyToSubmit} onClick={onSubmitClick}>
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" />
        ) : isEditMode ? (
          <SaveIcon className="size-4" data-icon="inline-start" />
        ) : (
          <PlusIcon className="size-4" data-icon="inline-start" />
        )}
        {isEditMode ? "Save Changes" : "Create Field"}
      </Button>
    </div>
  );
}

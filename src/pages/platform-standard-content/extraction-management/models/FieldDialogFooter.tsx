import { Loader2, SaveIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FieldDialogFooterNav({
  isFirstStep,
  isSaving,
  handlePreviousStep,
  handleNextStep,
  isLastStep,
}: {
  isFirstStep: boolean;
  isSaving: boolean;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  isLastStep?: boolean;
}) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isFirstStep || isSaving}
        className="min-w-[4.5rem]"
        onClick={handlePreviousStep}
      >
        Back
      </Button>
      {!isLastStep && (
        <Button
          type="button"
          variant="default"
          disabled={isSaving}
          className="min-w-24 px-4 cursor-pointer"
          onClick={handleNextStep}
        >
          Next
        </Button>
      )}
    </>
  );
}

export function FieldDialogFooterSubmit({
  isLastStep,
  isSaving,
  isEdit,
  onSubmitClick,
}: {
  isLastStep: boolean;
  isSaving: boolean;
  isEdit: boolean;
  onSubmitClick: () => void;
}) {
  if (!isLastStep) return null;

  return (
    <Button
      type="button"
      disabled={isSaving}
      className="min-w-24 px-4 cursor-pointer"
      onClick={onSubmitClick}
    >
      {isSaving ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : isEdit ? (
        <SaveIcon className="mr-2 size-4" />
      ) : (
        <PlusIcon className="mr-2 size-4" />
      )}
      {isEdit ? "Save changes" : "Add field"}
    </Button>
  );
}

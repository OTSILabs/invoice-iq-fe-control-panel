import type { NavigationFooterProps } from "@/types";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";



export default function TemplateFieldDialogNavigation({
  isFirstStep,
  isLastStep,
  isPending,
  onCancel,
  handlePreviousStep,
  handleNextStep,
}: NavigationFooterProps) {
  const cancelButton = (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={onCancel}
      className="border-destructive/40 text-destructive hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
    >
      Cancel
    </Button>
  );

  return (
    <div className="flex items-center gap-2">
      {onCancel ? cancelButton : <DialogClose asChild>{cancelButton}</DialogClose>}
      <Button type="button" variant="outline" disabled={isPending || isFirstStep} onClick={handlePreviousStep}>
        Back
      </Button>
      <Button type="button" variant="outline" disabled={isPending || isLastStep} onClick={handleNextStep}>
        Next
      </Button>
    </div>
  );
}

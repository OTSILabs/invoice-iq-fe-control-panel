import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

interface NavigationFooterProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isPending: boolean;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export default function TemplateFieldDialogNavigation({
  isFirstStep,
  isLastStep,
  isPending,
  handlePreviousStep,
  handleNextStep,
}: NavigationFooterProps) {
  return (
    <div className="flex items-center gap-2">
      <DialogClose asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="border-destructive/40 text-destructive hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
        >
          Cancel
        </Button>
      </DialogClose>
      <Button type="button" variant="outline" disabled={isPending || isFirstStep} onClick={handlePreviousStep}>
        Back
      </Button>
      <Button type="button" variant="outline" disabled={isPending || isLastStep} onClick={handleNextStep}>
        Next
      </Button>
    </div>
  );
}

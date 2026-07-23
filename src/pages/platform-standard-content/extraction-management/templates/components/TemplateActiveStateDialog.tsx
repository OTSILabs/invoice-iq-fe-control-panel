import type { ApiRecord } from "@/api/templates/api.helpers";
import { getTemplateIsActive, getTemplateName } from "@/components/invoice-ui/templates/template-data";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, PowerOff, RefreshCcw } from "lucide-react";

export function TemplateActiveStateDialog({
  template,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  template?: ApiRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}) {
  const nextIsActive = template ? !getTemplateIsActive(template) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {nextIsActive ? "Reactivate template?" : "Disable template?"}
          </DialogTitle>
          <DialogDescription>
            This will mark {template ? getTemplateName(template) : "this template"} as{" "}
            {nextIsActive ? "active" : "inactive"}.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="dialog-form-footer">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={nextIsActive ? "default" : "destructive"}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <Loader2
                className="size-4 animate-spin"
                data-icon="inline-start"
              />
            ) : nextIsActive ? (
              <RefreshCcw className="size-4" data-icon="inline-start" />
            ) : (
              <PowerOff className="size-4" data-icon="inline-start" />
            )}
            {nextIsActive ? "Reactivate Template" : "Disable Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

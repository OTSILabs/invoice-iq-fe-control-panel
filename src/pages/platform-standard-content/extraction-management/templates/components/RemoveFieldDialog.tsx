import type { ApiRecord } from "@/api/api.helpers";
import { getFieldLabel } from "@/components/invoice-ui/templates/template-data";
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
import { Loader2, Trash2 } from "lucide-react";

export function RemoveFieldDialog({
  field,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  field?: ApiRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}) {
  const fieldName = field ? getFieldLabel(field) : "this field";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove field from template?</DialogTitle>
          <DialogDescription>
            This removes {fieldName} from this template only. The reusable field
            remains available for other templates.
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
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <Loader2
                className="size-4 animate-spin"
                data-icon="inline-start"
              />
            ) : (
              <Trash2 className="size-4" data-icon="inline-start" />
            )}
            Remove Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

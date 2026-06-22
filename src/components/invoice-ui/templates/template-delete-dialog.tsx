import { Loader2, Trash2 } from "lucide-react";

import type { ApiRecord } from "@/api/api.helpers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getTemplateName } from "./template-data";

export function TemplateDeleteDialog({
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
  const templateName = template ? getTemplateName(template) : "this template";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete template?</DialogTitle>
          <DialogDescription>
            This will permanently delete {templateName}. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
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
            Delete Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

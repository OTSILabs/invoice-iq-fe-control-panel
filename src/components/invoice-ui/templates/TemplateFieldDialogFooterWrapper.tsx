import { DialogFooter } from "@/components/ui/dialog";

export default function TemplateFieldDialogFooterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DialogFooter className="dialog-form-footer relative z-10 sm:justify-between">{children}</DialogFooter>;
}
